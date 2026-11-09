import {test,expect,type Page} from '@playwright/test';
import {newProgress} from '../../src/game/persistence/SaveManager';
import {GameSimulation} from '../../src/game/engine/GameSimulation';
import {LEVELS} from '../../src/game/config/levels';
import {BUILDINGS} from '../../src/game/config/buildings';
import type {FarmState} from '../../src/game/config/types';
const read=(p:Page)=>p.evaluate(()=>JSON.parse(localStorage.getItem('happy-farm-rush-v1')!).active as FarmState);
async function openDay(p:Page){await p.goto('/?renderer=canvas');await p.getByRole('button',{name:'Продолжить день',exact:false}).first().click();await p.getByRole('button',{name:'Продолжить день',exact:false}).click();await expect(p.locator('canvas[data-ready=true]')).toBeVisible();await p.clock.runFor(500);}
async function assertOverlays(p:Page){
 const viewport=p.viewportSize()!,canvas=(await p.locator('canvas').boundingBox())!;expect(canvas.x).toBeCloseTo(0,0);expect(canvas.y).toBeCloseTo(0,0);expect(canvas.width).toBeCloseTo(viewport.width,0);expect(canvas.height).toBeCloseTo(viewport.height,0);
 const buttons=[];for(const el of await p.locator('.farm-stats>button,.farm-controls>button,.animal-menu-button').all())if(await el.isVisible()){const r=(await el.boundingBox())!;expect(r.x).toBeGreaterThanOrEqual(0);expect(r.y).toBeGreaterThan(0);expect(r.x+r.width).toBeLessThanOrEqual(canvas.width+1);expect(r.y+r.height).toBeLessThan(canvas.height);buttons.push(r);}
 for(let i=0;i<buttons.length;i++)for(let j=i+1;j<buttons.length;j++){const a=buttons[i],b=buttons[j];const width=Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x),height=Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y);expect(width>1&&height>1,'Overlay controls must not cover one another').toBe(false);}
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
