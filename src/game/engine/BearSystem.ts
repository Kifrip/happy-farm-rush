import type {FarmState,GameEvent} from '../config/types';
import {ECONOMY as E} from '../config/economy';
import {ANIMALS} from '../config/animals';
import {distance,move} from './AnimalAI';
export function updateBears(s:FarmState,dt:number,emit:(e:GameEvent)=>void):void {
 for(const b of s.bears){
  if(b.caged){b.cageTime=Math.max(0,b.cageTime-dt);if(b.cageTime<=0){b.caged=false;b.hits=0;b.warning=3;emit({kind:'bear',text:'A bear escaped its cage!',x:b.x,y:b.y});}continue;}
  if(b.warning>0){b.warning=Math.max(0,b.warning-dt);continue;}
  if(b.stun>0){b.stun=Math.max(0,b.stun-dt);continue;}
  b.attack=Math.max(0,b.attack-dt);
  const target=s.animals.filter(a=>ANIMALS[a.species].product).sort((a,c)=>distance(b,a)-distance(b,c))[0];
  if(target){move(b,target,E.bearSpeed/(1+b.hits*0.55),dt);if(distance(b,target)<34&&b.attack<=0){s.animals=s.animals.filter(a=>a.id!==target.id);s.lost++;b.attack=E.bearAttack;emit({kind:'error',text:'Bear attack! Tap the bear to build a cage.',x:b.x,y:b.y});}}
  s.drops=s.drops.filter(p=>distance(p,b)>25);
 }
}
