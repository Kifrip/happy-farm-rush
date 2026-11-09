import {test,expect} from '@playwright/test';
test('music continues through menus and pauses only when hidden',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?renderer=canvas&lang=en');expect(await page.locator('audio').count()).toBe(0);
 await page.getByRole('button',{name:'Let’s get growing',exact:false}).first().click();await page.getByRole('button',{name:'Let’s get growing',exact:false}).click();
 const audio=page.locator('audio[data-farm-music]');
 await expect.poll(()=>audio.evaluate((a:HTMLAudioElement)=>!a.paused&&a.currentTime>0)).toBe(true);
 expect(await audio.evaluate((a:HTMLAudioElement)=>({loop:a.loop,volume:a.volume,error:a.error?.code??null}))).toEqual({loop:true,volume:.05,error:null});
 await page.getByRole('button',{name:'Pause game',exact:true}).click();expect(await audio.evaluate((a:HTMLAudioElement)=>a.paused)).toBe(false);
 const position=await audio.evaluate((a:HTMLAudioElement)=>a.currentTime);
 await page.getByRole('button',{name:'Resume day',exact:true}).click();await expect.poll(()=>audio.evaluate((a:HTMLAudioElement)=>a.currentTime)).toBeGreaterThan(position);
 await page.locator('[data-action=market]').first().click();expect(await audio.evaluate((a:HTMLAudioElement)=>a.paused)).toBe(false);await expect.poll(()=>audio.evaluate((a:HTMLAudioElement)=>a.currentTime)).toBeGreaterThan(position);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});await expect.poll(()=>audio.evaluate((a:HTMLAudioElement)=>a.paused)).toBe(true);
 expect(errors).toEqual([]);
});
