import {test,expect,type Page} from '@playwright/test';
import {GameSimulation} from '../../src/game/engine/GameSimulation';
import {newProgress} from '../../src/game/persistence/SaveManager';
import {LEVELS} from '../../src/game/config/levels';
import type {FarmState} from '../../src/game/config/types';
const state=(p:Page)=>p.evaluate(()=>JSON.parse(localStorage.getItem('happy-farm-rush-v1')!).active as FarmState);
async function click(p:Page,x:number,y:number){await p.locator('canvas').scrollIntoViewIfNeeded();const b=await p.locator('canvas').boundingBox();if(!b)throw new Error('Missing canvas');await p.mouse.click(b.x+x/1000*b.width,b.y+y/650*b.height);}
async function save(p:Page){await p.getByRole('button',{name:'Pause game',exact:true}).click();const s=await state(p);await p.getByRole('button',{name:'Resume day',exact:false}).click();return s;}
test('three workshop chains, cage collection, selected cargo and exactly-once payment',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 // Arrange a valid interrupted final day; isolate production without skipping its timers or actions.
 const fixture=newProgress();fixture.unlocked=20;const farm=new GameSimulation(LEVELS[19]);farm.s.animals=[];farm.s.inventory.egg=1;farm.s.inventory.wool=1;farm.s.inventory.milk=1;fixture.active=farm.s;
 await page.addInitScript(value=>localStorage.setItem('happy-farm-rush-v1',value),JSON.stringify(fixture));await page.clock.install();await page.goto('/?renderer=canvas');await page.getByRole('button',{name:'Continue your day',exact:false}).click();await page.getByRole('button',{name:'Resume your day',exact:false}).click();await expect(page.locator('canvas[data-ready="true"]')).toBeVisible();
 await click(page,132,190);await click(page,125,325);await click(page,135,455);await page.clock.runFor(24000);
 let s=await save(page);expect(s.inventory.egg).toBe(0);expect(s.inventory.wool).toBe(0);expect(s.inventory.milk).toBe(0);expect(s.produced.powder).toBe(1);expect(s.produced.thread).toBe(1);expect(s.produced.butter).toBe(1);
 for(const d of s.drops)await click(page,d.x,d.y);
 await click(page,866,190);await click(page,875,325);await click(page,865,455);await page.clock.runFor(30000);
 s=await save(page);expect(s.produced.cake).toBe(1);expect(s.produced.cloth).toBe(1);expect(s.produced.cheese).toBe(1);for(const d of s.drops)await click(page,d.x,d.y);
 await page.clock.runFor(6000);s=await save(page);expect(s.bears.length).toBeGreaterThan(0);const bear=s.bears[0];for(let i=0;i<4;i++)await click(page,bear.x,bear.y-16);
 s=await save(page);expect(s.inventory.bear).toBe(1);expect(s.collected.bear).toBe(1);expect(s.inventory.cake).toBe(1);expect(s.inventory.cloth).toBe(1);expect(s.inventory.cheese).toBe(1);
 await page.screenshot({path:`screenshots/production-${info.project.name}.png`,fullPage:true});await page.getByRole('button',{name:'Warehouse',exact:false}).click();await page.getByRole('button',{name:'Load cake',exact:true}).click();await page.getByRole('button',{name:'Load cloth',exact:true}).click();await page.getByRole('button',{name:'Load cheese',exact:true}).click();await page.screenshot({path:`screenshots/market-${info.project.name}.png`,fullPage:true});const coins=s.coins;
 await page.getByRole('button',{name:'Send delivery',exact:false}).click();s=await state(page);expect(s.inventory.cake).toBe(0);expect(s.coins).toBe(coins);expect(s.truck.remaining).toBeGreaterThan(0);await page.clock.runFor(16000);s=await save(page);expect(s.coins).toBe(coins+553);expect(s.revenue).toBe(553);expect(s.delivered.cheese).toBe(1);expect(s.truck.remaining).toBe(0);await page.clock.runFor(16000);s=await save(page);expect(s.coins).toBe(coins+553);expect(errors).toEqual([]);
});
