import type {Animal,FarmState,GameEvent,Point,Product} from '../config/types';
import {ANIMALS} from '../config/animals';
import {ECONOMY as E} from '../config/economy';
import {PRODUCTS} from '../config/products';
export const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
export function move(a:Animal|Point,target:Point,speed:number,dt:number):void {const d=distance(a,target);if(d>1){const k=Math.min(1,speed*dt/d);a.x+=(target.x-a.x)*k;a.y+=(target.y-a.y)*k;}}
export interface AIContext {s:FarmState;random:()=>number;emit:(e:GameEvent)=>void;drop:(p:Product,at:Point)=>void;collect:(id:number)=>boolean;used:()=>number;capacity:()=>number}
export function updateAnimals(c:AIContext,dt:number):void {
 const {s}=c;
 for(const a of [...s.animals]){
  const cfg=ANIMALS[a.species];a.bark=Math.max(0,a.bark-dt);
  if(a.species==='cat'){
   const d=s.drops.filter(p=>c.used()+PRODUCTS[p.kind].slots<=c.capacity()).sort((p,q)=>distance(a,p)-distance(a,q))[0];
   if(d){a.state='seeking';a.target={x:d.x,y:d.y};move(a,d,cfg.speed,dt);if(distance(a,d)<23)c.collect(d.id);}else wander(c,a,dt);continue;
  }
  if(a.species==='dog'){
   const b=s.bears.find(b=>!b.caged&&b.warning<=0);
   if(b){a.target={x:b.x,y:b.y};a.state='seeking';move(a,b,cfg.speed,dt);if(distance(a,b)<95&&a.bark<=0){b.stun=3.5;a.bark=11;c.emit({kind:'capture',text:'Woof! Bear delayed',x:a.x,y:a.y});}}else wander(c,a,dt);continue;
  }
  a.hunger+=cfg.hunger*dt;
  const threat=s.bears.find(b=>!b.caged&&b.warning<=0&&b.stun<=0&&distance(a,b)<125);
  if(threat){a.state='fleeing';a.target={x:Math.min(E.field.right,Math.max(E.field.left,a.x+(a.x-threat.x)*2)),y:Math.min(E.field.bottom,Math.max(E.field.top,a.y+(a.y-threat.y)*2))};move(a,a.target,cfg.speed*1.35,dt);}
  else {
   const food=a.hunger>17?s.grass.filter(g=>g.food>0).sort((g,h)=>distance(a,g)-distance(a,h))[0]:undefined;
   if(food){a.target={x:food.x,y:food.y};if(distance(a,food)>23){a.state='seeking';move(a,food,cfg.speed,dt);}else{a.state='eating';const eaten=Math.min(food.food,E.eatRate*dt);food.food-=eaten;a.hunger=Math.max(0,a.hunger-eaten*E.feedRate/E.eatRate);}}
   else wander(c,a,dt);
   if(a.hunger<E.hungerStop){a.cooldown-=dt;if(a.cooldown<=0&&cfg.product){a.cooldown=cfg.interval;a.state='producing';s.produced[cfg.product]++;c.drop(cfg.product,{x:a.x+18,y:a.y+14});c.emit({kind:'product',text:PRODUCTS[cfg.product].name,x:a.x,y:a.y});}}
  }
  if(a.hunger>E.starvation){s.animals=s.animals.filter(o=>o.id!==a.id);s.lost++;c.emit({kind:'error',text:`A hungry ${cfg.name.toLowerCase()} left. Keep grass growing!`,x:a.x,y:a.y});}
 }
 // Soft separation, bounded and deterministic; never changes targets or snaps to a grid.
 for(let i=0;i<s.animals.length;i++)for(let j=i+1;j<s.animals.length;j++){
  const a=s.animals[i],b=s.animals[j],d=distance(a,b);if(d<29&&d>0.01){const f=(29-d)*dt;const dx=(a.x-b.x)/d*f,dy=(a.y-b.y)/d*f;a.x+=dx;a.y+=dy;b.x-=dx;b.y-=dy;}
 }
 for(const a of s.animals){a.x=Math.max(E.field.left,Math.min(E.field.right,a.x));a.y=Math.max(E.field.top,Math.min(E.field.bottom,a.y));}
 s.grass=s.grass.filter(g=>g.food>0.01);
}
function wander(c:AIContext,a:Animal,dt:number):void {
 if(a.warning>0){a.warning=Math.max(0,a.warning-dt);a.state='idle';return;}
 a.state='wandering';if(distance(a,a.target)<8){a.target={x:E.field.left+25+c.random()*(E.field.right-E.field.left-50),y:E.field.top+20+c.random()*(E.field.bottom-E.field.top-40)};a.state='idle';a.warning=.6+c.random()*1.2;return;}
 move(a,a.target,ANIMALS[a.species].speed*0.65,dt);
}
