import {test,expect,type Page} from '@playwright/test';
import type {FarmState} from '../../src/game/config/types';
const state=(page:Page)=>page.evaluate(()=>JSON.parse(localStorage.getItem('happy-farm-rush-v1')!).active as FarmState|null);
async function worldClick(page:Page,x:number,y:number){await page.locator('canvas').scrollIntoViewIfNeeded();const box=await page.locator('canvas').boundingBox();if(!box)throw new Error('Farm canvas is unavailable');await page.mouse.click(box.x+x/1000*box.width,box.y+y/650*box.height);}
async function startDay(page:Page){await page.getByRole('button',{name:'Let’s get growing',exact:false}).first().click();await expect(page.getByRole('dialog')).toBeVisible();await page.getByRole('button',{name:'Let’s get growing',exact:false}).click();await expect(page.locator('canvas[data-ready="true"]')).toBeVisible();}
test('new campaign, real harvest, medal, upgrades, next day and save restore',async({page},testInfo)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.install();await page.goto('/?renderer=canvas');await page.screenshot({path:`screenshots/map-${testInfo.project.name}.png`,fullPage:true});
 await startDay(page);const before=(await state(page))!;await worldClick(page,500,440);await page.clock.runFor(6000);expect((await state(page))!.water).toBe(before.water-1);expect((await state(page))!.grass.length).toBeGreaterThan(0);
 await page.screenshot({path:`screenshots/farm-${testInfo.project.name}.png`,fullPage:true});
 for(let i=0;i<30;i++){
  if(await page.getByText('A good day’s work.',{exact:true}).count())break;
  await page.clock.runFor(5000);const s=await state(page);if(s)for(const drop of s.drops)await worldClick(page,drop.x,drop.y);
 }
 await expect(page.getByText('A good day’s work.',{exact:true})).toBeVisible();await expect(page.getByText('New stars earned')).toBeVisible();expect(errors).toEqual([]);
 await page.screenshot({path:`screenshots/result-${testInfo.project.name}.png`,fullPage:true});
 await page.getByRole('button',{name:'Return to the journey',exact:true}).click();await page.getByRole('button',{name:'Upgrades',exact:false}).click();await expect(page.getByText('Room to grow.',{exact:false})).toBeVisible();await page.screenshot({path:`screenshots/shop-${testInfo.project.name}.png`,fullPage:true});
 await page.getByRole('button',{name:'Level 1 2',exact:true}).first().click();
 await page.getByRole('button',{name:'Back to your journey',exact:false}).click();await page.locator('.level-card[data-action="level"][data-key="2"]').click();await page.getByRole('button',{name:'Let’s get growing',exact:false}).click();await expect(page.locator('canvas[data-ready="true"]')).toBeVisible();await page.clock.runFor(7000);await worldClick(page,520,440);await page.getByRole('button',{name:'Pause game',exact:true}).click();const saved=await state(page);expect(saved?.level).toBe(2);expect(saved?.time).toBeGreaterThan(5);
 await page.clock.fastForward(60000);expect((await state(page))!.time).toBe(saved!.time);await page.reload();await page.getByRole('button',{name:'Continue your day',exact:false}).click();await page.getByRole('button',{name:'Resume your day',exact:false}).click();await expect(page.locator('canvas[data-ready="true"]')).toBeVisible();const restored=await state(page);expect(restored?.water).toBe(saved?.water);expect(restored?.time).toBe(saved?.time);
 const campaign=await page.evaluate(()=>JSON.parse(localStorage.getItem('happy-farm-rush-v1')!));expect(campaign.best['1']).toBeTruthy();expect(campaign.upgrades.well).toBe(1);expect(campaign.stars+campaign.spent).toBe(campaign.totalEarned);expect(errors).toEqual([]);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});const hiddenTime=(await state(page))!.time;await page.clock.fastForward(60000);expect((await state(page))!.time).toBe(hiddenTime);await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));});await expect(page.getByText('The farm can wait.',{exact:true})).toBeVisible();
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);expect(overflow).toBe(false);
});
