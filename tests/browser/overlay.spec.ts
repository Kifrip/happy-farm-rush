import {test,expect,type Page} from '@playwright/test';
import {newProgress} from '../../src/game/persistence/SaveManager';
import {GameSimulation} from '../../src/game/engine/GameSimulation';
import {LEVELS} from '../../src/game/config/levels';
import {BUILDINGS} from '../../src/game/config/buildings';
import {HUD_SELECTORS} from '../../src/ui/FarmLayout';
import type {FarmState} from '../../src/game/config/types';
const read=(p:Page)=>p.evaluate(()=>JSON.parse(localStorage.getItem('happy-farm-rush-v1')!).active as FarmState);
async function openDay(p:Page){await p.goto('/?renderer=canvas');await p.getByRole('button',{name:'Продолжить день',exact:false}).first().click();await p.getByRole('button',{name:'Продолжить день',exact:false}).click();await expect(p.locator('canvas[data-ready=true]')).toBeVisible();await p.clock.runFor(500);}
async function assertFullStructureBounds(p:Page){
 await expect.poll(()=>p.locator('canvas').getAttribute('data-structure-bounds')).not.toBeNull();
 const {structures,hud}=await p.evaluate(selector=>{
  const canvas=document.querySelector('canvas')!,area=canvas.getBoundingClientRect();
  const structures=JSON.parse(canvas.dataset.structureBounds??'[]') as Array<{id:string;x:number;y:number;width:number;height:number}>;
  const hud=[];for(const e of document.querySelectorAll<HTMLElement>(selector)){const r=e.getBoundingClientRect();if(!r.width||!r.height)continue;const clip=e.closest('.objectives')?.getBoundingClientRect();const x=Math.max(r.left,area.left,clip?.left??-Infinity),y=Math.max(r.top,area.top,clip?.top??-Infinity),right=Math.min(r.right,area.right,clip?.right??Infinity),bottom=Math.min(r.bottom,area.bottom,clip?.bottom??Infinity);if(right>x&&bottom>y)hud.push({name:e.getAttribute('aria-label')??e.className,x:x-area.left,y:y-area.top,width:right-x,height:bottom-y});}
  return {structures,hud};
 },HUD_SELECTORS);
 expect(structures.length).toBeGreaterThanOrEqual(16);
 for(const building of structures)for(const card of hud){const width=Math.min(building.x+building.width,card.x+card.width)-Math.max(building.x,card.x),height=Math.min(building.y+building.height,card.y+card.height)-Math.max(building.y,card.y);expect(width>.75&&height>.75,`${building.id} is covered by ${card.name}: overlap ${width.toFixed(1)}×${height.toFixed(1)}`).toBe(false);}
}
async function assertOverlays(p:Page){
 const viewport=p.viewportSize()!,canvas=(await p.locator('canvas').boundingBox())!;expect(canvas.x).toBeCloseTo(0,0);expect(canvas.y).toBeCloseTo(0,0);expect(canvas.width).toBeCloseTo(viewport.width,0);expect(canvas.height).toBeCloseTo(viewport.height,0);
 const buttons=[];for(const el of await p.locator('.farm-stats>button,.farm-controls>button,.animal-menu-button').all())if(await el.isVisible()){const r=(await el.boundingBox())!;expect(r.x).toBeGreaterThanOrEqual(0);expect(r.y).toBeGreaterThan(0);expect(r.x+r.width).toBeLessThanOrEqual(canvas.width+1);expect(r.y+r.height).toBeLessThan(canvas.height);buttons.push(r);}
 for(let i=0;i<buttons.length;i++)for(let j=i+1;j<buttons.length;j++){const a=buttons[i],b=buttons[j];const width=Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x),height=Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y);expect(width>1&&height>1,'Overlay controls must not cover one another').toBe(false);}
 await assertFullStructureBounds(p);
 // Every building and the well still receive taps through the canvas, rather than a HUD panel.
 for(const point of [{x:500,y:85},...Object.values(BUILDINGS).map(b=>({x:b.x,y:b.y-25}))]){
  const x=point.x/1000*canvas.width,y=point.y/650*canvas.height;
  expect(await p.evaluate(({x,y})=>!!document.elementFromPoint(x,y)?.closest('#farm-stage'),{x,y}),`Building at ${point.x},${point.y} was covered by UI`).toBe(true);
 }
}
test('floating game controls preserve late-level access and animal purchases',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));const progress=newProgress();progress.unlocked=20;progress.active=new GameSimulation(LEVELS[19]).s;progress.active.coins=2000;
 await page.addInitScript(raw=>localStorage.setItem('happy-farm-rush-v1',raw),JSON.stringify(progress));await page.clock.install();await openDay(page);const mobile=info.project.name!=='desktop';if(mobile)await assertOverlays(page);
 const initial=await read(page),cows=initial.animals.filter(a=>a.species==='cow').length;
 if(mobile){await page.getByRole('button',{name:'Животные',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();}
 await page.getByRole('button',{name:'Купить: Корова',exact:true}).click();if(mobile)await page.getByRole('button',{name:'Продолжить',exact:true}).click();await page.getByRole('button',{name:'Пауза',exact:true}).click();const bought=await read(page);expect(bought.animals.filter(a=>a.species==='cow')).toHaveLength(cows+1);expect(bought.coins).toBe(initial.coins-540);expect(bought.water).toBe(initial.water);expect(bought.grass.every(g=>initial.grass.some(before=>before.id===g.id))).toBe(true);
 if(mobile){let frozen=bought;for(const viewport of [{width:320,height:740},{width:740,height:320}]){await page.setViewportSize(viewport);await page.clock.runFor(500);expect((await read(page)).animals).toEqual(frozen.animals);await page.getByRole('button',{name:'Продолжить',exact:true}).click();await assertOverlays(page);await page.getByRole('button',{name:'Пауза',exact:true}).click();frozen=await read(page);}await page.setViewportSize(info.project.use.viewport!);await page.clock.runFor(500);}
 await page.getByRole('button',{name:'Продолжить',exact:true}).click();await page.screenshot({path:`screenshots/floating-controls-${info.project.name}.png`});expect(errors).toEqual([]);
});

test('full roofs and labels remain uncovered across phone aspect ratios',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));const progress=newProgress();progress.unlocked=20;progress.active=new GameSimulation(LEVELS[19]).s;
 for(const m of progress.active.machines){m.batch=1;m.duration=BUILDINGS[m.kind].time;m.remaining=m.duration;}
 await page.addInitScript(raw=>localStorage.setItem('happy-farm-rush-v1',raw),JSON.stringify(progress));await page.clock.install();await openDay(page);
 const mobile=info.project.name!=='desktop';const cases=mobile?[{width:384,height:765},{width:390,height:700},{width:320,height:568},{width:430,height:740},{width:480,height:568},{width:600,height:600},{width:740,height:320},{width:844,height:390},{width:1024,height:768}]:[info.project.use.viewport!];
 for(const viewport of cases){await page.setViewportSize(viewport);await page.clock.runFor(600);await assertFullStructureBounds(page);}
 await page.setViewportSize(info.project.use.viewport!);await page.clock.runFor(500);await page.screenshot({path:`screenshots/uncovered-buildings-${info.project.name}.png`});expect(errors).toEqual([]);
});
