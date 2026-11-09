import {describe,it,expect} from 'vitest';
import {fitRoadsideSprite,rectsOverlap} from '../src/ui/FarmLayout';
describe('roadside structures stay clear of floating controls',()=>{
 it('keeps an unobstructed sprite at its preferred size and position',()=>{const sprite={x:100,y:650,width:70,height:50};expect(fitRoadsideSprite(sprite,[{x:300,y:700,width:60,height:60}],600,800)).toEqual(sprite);});
 it('moves a warehouse above a dock rather than allowing partial roof/body overlap',()=>{const hud={x:175,y:691,width:200,height:60};const r=fitRoadsideSprite({x:160,y:647,width:66,height:48},[hud],594,765);expect(rectsOverlap(r,hud,7.9)).toBe(false);expect(r.y).toBeGreaterThanOrEqual(602);expect(r.width/r.height).toBeCloseTo(66/48);});
 it('shrinks proportionally when a short portrait window has limited roadside space',()=>{const hud={x:160,y:494,width:210,height:60};const r=fitRoadsideSprite({x:161,y:474,width:66,height:48},[hud],441,568);expect(rectsOverlap(r,hud,7.9)).toBe(false);expect(r.y).toBeGreaterThanOrEqual(449);expect(r.height).toBeLessThan(48);expect(r.width/r.height).toBeCloseTo(66/48);});
 it('does not move a sprite for a HUD card on the other side of the road',()=>{const sprite={x:320,y:330,width:90,height:40};expect(fitRoadsideSprite(sprite,[{x:600,y:320,width:120,height:60}],300,390)).toEqual(sprite);});
});
