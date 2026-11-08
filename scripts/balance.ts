import {writeFileSync} from 'node:fs';
import {GameSimulation} from '../src/game/engine/GameSimulation';
import {LEVELS} from '../src/game/config/levels';
import {updateBears} from '../src/game/engine/BearSystem';
import {ANIMALS} from '../src/game/config/animals';
import {BUILDINGS} from '../src/game/config/buildings';
import {PRODUCTS} from '../src/game/config/products';
import {emptyInventory} from '../src/game/config/economy';
import {objectiveProgress,medalFor} from '../src/game/engine/ObjectiveSystem';
import type {Product,Species} from '../src/game/config/types';
export const profiles=['beginner','average','efficient','storage-shortage','bear-loss'] as const;
export type Profile=typeof profiles[number];
export function simulate(levelIndex:number,profile:Profile){
 const g=new GameSimulation(LEVELS[levelIndex]);const l=g.level;let nextAction=0,recoveries=0;let removed=false;let refused=0;
 const interval=profile==='beginner'?4:profile==='efficient'?.4:profile==='storage-shortage'?2:1.3;
 for(let step=0;step<18000&&!g.s.complete;step++){
  const s=g.s;if(s.time+1e-8>=nextAction){nextAction+=interval;
   if(profile==='bear-loss'&&s.bears.length&&!removed){const a=s.animals.find(a=>ANIMALS[a.species].product);if(a){const b=s.bears.find(b=>!b.caged);if(b){b.x=a.x;b.y=a.y;b.warning=0;b.stun=0;b.attack=0;const dog=s.animals.find(v=>v.species==='dog');if(dog)dog.bark=10;updateBears(s,.05,g.emit);removed=s.lost>0;}}}
   for(const b of [...s.bears]){if(!b.caged){for(let i=0;i<3;i++)g.capture(b.id);}if(b.caged)g.capture(b.id);}
   for(const p of [...s.drops].sort((a,b)=>PRODUCTS[b.kind].price-PRODUCTS[a.kind].price))if(!g.collect(p.id))refused++;
   // Work backward through each chain, retaining raw resources until downstream goals are met.
   for(const m of [...s.machines].reverse()){
    const b=BUILDINGS[m.kind];const need=l.objectives.some(o=>(['produce','collect','deliver','stock'].includes(o.type)&&isAncestor(b.output,o.key as Product)||['revenue','balance'].includes(o.type))&&objectiveProgress(s,o)<o.amount);
    if(need||s.coins<60)g.process(m.kind);
   }
   const productive=s.animals.filter(a=>ANIMALS[a.species].product);const hunger=productive.some(a=>a.hunger>30);
   if(hunger&&s.grass.reduce((n,p)=>n+p.food,0)<productive.length*17){
    for(const a of productive.filter(a=>a.hunger>25))if(s.water>0){const offsets=[[0,0],[34,0],[-34,0],[0,34],[0,-34],[34,34]];for(const [dx,dy] of offsets){if(g.plant(Math.min(785,Math.max(215,a.x+dx)),Math.min(500,Math.max(170,a.y+dy))))break;}}
   }
   if(s.water<3&&s.refill<=0&&s.coins>=g.refillCost())g.refill();
   for(const o of l.objectives)if(o.type==='own'&&objectiveProgress(s,o)<o.amount&&s.coins>=ANIMALS[o.key as Species].price)g.buy(o.key as Species);
   // Replace a lost species if needed for an unfinished production chain.
   for(const species of ['goose','sheep','cow'] as Species[]){const p=ANIMALS[species].product!;const need=l.objectives.some(o=>['produce','collect','deliver','stock'].includes(o.type)&&isAncestor(p,o.key as Product)&&objectiveProgress(s,o)<o.amount);if(need&&!s.animals.some(a=>a.species===species)&&l.unlocked.includes(species)&&s.coins>=ANIMALS[species].price)g.buy(species);}
   if(s.truck.remaining===0){const cargo=emptyInventory();let slots=0;
    const ordered=(Object.keys(PRODUCTS) as Product[]).sort((a,b)=>PRODUCTS[b].price-PRODUCTS[a].price);
    for(const p of ordered){let reserve=0;const consuming=s.machines.find(m=>BUILDINGS[m.kind].input===p);if(consuming){const out=BUILDINGS[consuming.kind].output;const need=l.objectives.some(o=>['produce','collect','deliver','stock'].includes(o.type)&&isAncestor(out,o.key as Product)&&objectiveProgress(s,o)<o.amount);if(need)reserve=profile==='storage-shortage'&&g.used()<g.capacity()-3?3:1;}
     const stockGoal=l.objectives.find(o=>o.type==='stock'&&o.key===p);if(stockGoal)reserve=Math.max(reserve,stockGoal.amount);
     while(cargo[p]<Math.max(0,s.inventory[p]-reserve)&&slots+PRODUCTS[p].slots<=g.cargoCapacity()){cargo[p]++;slots+=PRODUCTS[p].slots;}
    }
    const overdue=l.objectives.some(o=>o.type==='deliver'&&s.inventory[o.key as Product]>0&&objectiveProgress(s,o)<o.amount);const wait=profile==='storage-shortage'?g.used()>=g.capacity()-2||overdue:true;
    if(slots>0&&(wait||s.coins<30||s.bears.some(b=>b.caged)))g.dispatch(cargo);
   }
   if(productive.length===0||s.water===0&&s.grass.length===0&&s.coins<g.refillCost()){if(g.aid())recoveries++;}
  }
  g.step();g.events=[];
 }
 return {level:l.id,profile,complete:g.s.complete,time:Math.round(g.s.time),medal:g.s.complete?medalFor(g.s.time,l.gold,l.silver):0,coins:g.s.coins,lost:g.s.lost,recoveries,refused,goals:l.objectives.map(o=>`${o.type}:${o.key} ${objectiveProgress(g.s,o)}/${o.amount}`).join('; ')};
}
function isAncestor(input:Product,output:Product):boolean {if(input===output)return true;const b=Object.values(BUILDINGS).find(b=>b.output===output);return b?isAncestor(input,b.input):false;}
if(process.argv[1]?.endsWith('balance.ts')){const results=profiles.flatMap(p=>LEVELS.map((_,i)=>simulate(i,p)));writeFileSync('balance-results.json',JSON.stringify(results,null,2));for(const p of profiles){const rows=results.filter(r=>r.profile===p);console.log(p,`${rows.filter(r=>r.complete).length}/20 complete; ${(rows.reduce((n,r)=>n+r.time,0)/60).toFixed(1)} campaign minutes`);for(const r of rows)console.log(`  ${r.level}: ${r.time}s ${r.complete?'OK':'FAILED'} ${r.complete?'':r.goals}`);}}
