import {describe,it,expect} from 'vitest';
import {profiles,simulate} from '../scripts/balance';
import {LEVELS} from '../src/game/config/levels';
describe('campaign economic playthroughs, with no persistent upgrades',()=>{
 for(const profile of profiles)for(const level of LEVELS)it(`${profile}: day ${level.id} is solvable`,()=>{const result=simulate(level.id-1,profile);expect(result.complete,result.goals).toBe(true);expect(result.time).toBeLessThan(900);});
 it('adverse bear scenario actually exercises a lost animal',()=>{const result=simulate(19,'bear-loss');expect(result.lost).toBeGreaterThan(0);expect(result.complete).toBe(true);});
});
