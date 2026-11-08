import type {Animal,Building,FarmState,GameEvent,Inventory,Level,Point,Product,Species,Upgrades} from '../config/types';
import {ANIMALS} from '../config/animals';
import {PRODUCTS} from '../config/products';
import {BUILDINGS} from '../config/buildings';
import {ECONOMY as E,emptyInventory,emptyUpgrades} from '../config/economy';
import {LEVELS} from '../config/levels';
import {objectiveProgress} from './ObjectiveSystem';
import {updateAnimals} from './AnimalAI';
import {updateBears} from './BearSystem';
export class GameSimulation {
 s:FarmState;events:GameEvent[]=[];
 constructor(public level:Level,upgrades:Upgrades=emptyUpgrades(),saved?:FarmState){
  if(saved){this.s=structuredClone(saved);return;}
  this.s={level:level.id,seed:8137+level.id*93,nextId:1,time:0,coins:level.coins,water:level.water,refill:0,animals:[],grass:[],drops:[],bears:[],machines:level.buildings.map(kind=>({kind,level:1,remaining:0,duration:0,batch:0})),inventory:{...emptyInventory(),...level.inventory},collected:emptyInventory(),produced:emptyInventory(),delivered:emptyInventory(),revenue:0,truck:{remaining:0,duration:0,cargo:emptyInventory(),value:0},spawned:0,complete:false,lost:0,upgrades:{...upgrades,...level.activeUpgrades}};
  for(const [species,count] of Object.entries(level.animals))for(let i=0;i<(count??0);i++)this.addAnimal(species as Species);
  for(let i=0;i<(level.id===1?1:4);i++)this.s.grass.push({id:this.id(),x:330+i*105,y:280+(i%2)*90,food:E.grassFood,age:3});
 }
 static restore(state:FarmState):GameSimulation{return new GameSimulation(LEVELS[state.level-1],state.upgrades,state);}
 id=():number=>this.s.nextId++;
 random=():number=>{this.s.seed=(Math.imul(this.s.seed,1664525)+1013904223)>>>0;return this.s.seed/4294967296;};
 emit=(e:GameEvent):void=>{if(this.events.length<100)this.events.push(e);};
 fail=(text:string):false=>{this.emit({kind:'error',text});return false;};
 capacity=():number=>(this.level.capacity??E.warehouse)+this.s.upgrades.warehouse*8;
 used=():number=>this.inventorySize(this.s.inventory);
 inventorySize=(inv:Inventory):number=>(Object.keys(PRODUCTS) as Product[]).reduce((n,p)=>n+inv[p]*PRODUCTS[p].slots,0);
 cargoCapacity=():number=>E.truckCapacity+this.s.upgrades.cargo*6;
 waterCapacity=():number=>E.waterCapacity+this.s.upgrades.well*5;
 refillCost=():number=>E.waterCost-this.s.upgrades.refill*2;
 addAnimal(species:Species):Animal {
  const a:Animal={id:this.id(),species,x:290+this.random()*410,y:215+this.random()*230,target:{x:280+this.random()*430,y:220+this.random()*245},hunger:25,cooldown:7+this.random()*3,state:'idle',warning:0,bark:0};this.s.animals.push(a);return a;
 }
 buy(species:Species):boolean {
  if(this.s.complete)return false;if(!this.level.unlocked.includes(species))return this.fail('This friend unlocks later.');
  if(this.s.animals.length>=22)return this.fail('The pasture has room for 22 friends.');
  if(this.s.coins<ANIMALS[species].price)return this.fail('Not enough coins. Send a delivery to market.');
  this.s.coins-=ANIMALS[species].price;this.addAnimal(species);this.emit({kind:'buy',text:`Welcome, little ${species}!`});return true;
 }
 plant(x:number,y:number):boolean {
  if(this.s.complete)return false;const f=E.field;if(x<f.left||x>f.right||y<f.top||y>f.bottom)return false;
  if(!this.s.water)return this.fail('The well is empty. Refill it for fresh water.');
  if(this.s.grass.length>=E.grassLimit)return this.fail('Plenty of grass! Let your animals enjoy it.');
  if(this.s.grass.some(g=>Math.hypot(g.x-x,g.y-y)<27))return this.fail('Grass is already growing here.');
  this.s.water--;this.s.grass.push({id:this.id(),x,y,food:E.grassFood,age:0});this.emit({kind:'plant',text:'A little greener',x,y});return true;
 }
 refill():boolean {
  if(this.s.complete||this.s.refill>0)return false;if(this.s.water>=this.waterCapacity())return this.fail('Your well is already full.');
  if(this.s.coins<this.refillCost())return this.fail('Need coins for water. Ship goods, or use farm aid if stranded.');
  this.s.coins-=this.refillCost();this.s.refill=E.refillTime-this.s.upgrades.refill*0.7;this.emit({kind:'water',text:'Fresh water on its way…'});return true;
 }
 drop=(kind:Product,at:Point):void=>{this.s.drops.push({id:this.id(),kind,x:at.x,y:at.y,age:0});};
 collect=(id:number):boolean=>{
  if(this.s.complete)return false;const p=this.s.drops.find(p=>p.id===id);if(!p)return false;
  if(this.used()+PRODUCTS[p.kind].slots>this.capacity())return this.fail('Warehouse full! Process goods or send a delivery.');
  this.s.inventory[p.kind]++;this.s.collected[p.kind]++;this.s.drops=this.s.drops.filter(d=>d.id!==id);this.emit({kind:'collect',text:`+1 ${PRODUCTS[p.kind].name}`,x:p.x,y:p.y,asset:p.kind});return true;
 };
 process(kind:Building):boolean {
  if(this.s.complete)return false;const m=this.s.machines.find(m=>m.kind===kind);if(!m)return this.fail('This workshop is not available in this level.');
  if(m.remaining>0)return this.fail('Still crafting. Watch the progress bar.');const b=BUILDINGS[kind];
  const batch=Math.min(this.s.inventory[b.input],m.level+this.s.upgrades.batch);
  if(batch<1)return this.fail(`Collect ${PRODUCTS[b.input].name.toLowerCase()} first.`);
  this.s.inventory[b.input]-=batch;m.batch=batch;m.duration=b.time*(1-this.s.upgrades.factory*0.15)/(1+(m.level-1)*0.2);m.remaining=m.duration;this.emit({kind:'factory',text:`Making ${PRODUCTS[b.output].name.toLowerCase()}…`,x:b.x,y:b.y});return true;
 }
 upgradeMachine(kind:Building):boolean {
  const m=this.s.machines.find(m=>m.kind===kind);if(!m||m.level>=3||this.s.complete)return false;
  const cost=BUILDINGS[kind].upgrade*m.level;if(this.s.coins<cost)return this.fail(`Workshop upgrade costs ${cost} coins.`);
  this.s.coins-=cost;m.level++;this.emit({kind:'buy',text:`${BUILDINGS[kind].short} upgraded to level ${m.level}`});return true;
 }
 dispatch(cargo:Inventory):boolean {
  if(this.s.complete)return false;if(this.s.truck.remaining>0)return this.fail('The truck is still on the road.');
  const keys=Object.keys(PRODUCTS) as Product[];
  if(keys.some(p=>!Number.isSafeInteger(cargo[p])||cargo[p]<0||cargo[p]>this.s.inventory[p]))return this.fail('Choose goods available in your warehouse.');
  const size=this.inventorySize(cargo);if(!size)return this.fail('Select a few goods for your delivery.');if(size>this.cargoCapacity())return this.fail('Too much cargo. Take a smaller delivery.');
  let value=0;for(const p of keys){this.s.inventory[p]-=cargo[p];value+=cargo[p]*PRODUCTS[p].price;}
  const duration=E.travel-this.s.upgrades.truck*2.5;this.s.truck={remaining:duration,duration,cargo:{...cargo},value};this.emit({kind:'dispatch',text:`Off to market · ${value} coins on return`});return true;
 }
 capture(id:number):boolean {
  if(this.s.complete)return false;const b=this.s.bears.find(b=>b.id===id);if(!b)return false;
  if(b.caged){if(this.used()+PRODUCTS.bear.slots>this.capacity())return this.fail('The cage needs 5 free warehouse slots.');this.s.inventory.bear++;this.s.collected.bear++;this.s.bears=this.s.bears.filter(v=>v.id!==id);this.emit({kind:'collect',text:'Bear safely stored',x:b.x,y:b.y,asset:'bear'});return true;}
  b.hits++;b.stun=1.4;
  if(b.hits>=Math.max(1,3-Math.floor((this.s.upgrades.cage+1)/2))){b.caged=true;b.cageTime=E.cageDuration+this.s.upgrades.cage*12;this.emit({kind:'capture',text:'Captured! Tap the cage to collect.',x:b.x,y:b.y});}else this.emit({kind:'capture',text:'Keep tapping!',x:b.x,y:b.y});return true;
 }
 aid():boolean {
  if(this.s.complete)return false;
  const productive=this.s.animals.filter(a=>ANIMALS[a.species].product);
  if(productive.length>0&&(this.s.water>0||this.s.grass.length>0||this.s.coins>=this.refillCost()))return this.fail('Your farm can keep going. Save farm aid for an emergency.');
  if(productive.length===0){const needed:Species[]=this.level.id>=13?['goose','sheep','cow']:this.level.id>=7?['goose','sheep']:['goose'];for(const species of needed)if(this.level.unlocked.includes(species))this.addAnimal(species);}
  this.s.water=this.waterCapacity();this.s.time+=30;this.emit({kind:'water',text:'Neighbors brought water and animals. +30s on your timer.'});return true;
 }
 step(dt=E.step):void {
  const s=this.s;if(s.complete)return;s.time+=dt;
  for(const g of s.grass)g.age+=dt;
  if(s.refill>0){s.refill-=dt;if(s.refill<=0){s.refill=0;s.water=this.waterCapacity();this.emit({kind:'water',text:'The well is full!'});}}
  for(const p of s.drops)p.age+=dt;s.drops=s.drops.filter(p=>p.age<E.expiration);
  for(const m of s.machines)if(m.remaining>0){m.remaining=Math.max(0,m.remaining-dt);if(m.remaining===0){const b=BUILDINGS[m.kind];for(let i=0;i<m.batch;i++){s.produced[b.output]++;this.drop(b.output,{x:b.x+(b.x<500?65:-65)+(i%2)*20,y:b.y+33+Math.floor(i/2)*19});}this.emit({kind:'product',text:`${PRODUCTS[b.output].name} ready!`,x:b.x,y:b.y});}}
  if(s.truck.remaining>0){s.truck.remaining=Math.max(0,s.truck.remaining-dt);if(s.truck.remaining===0){s.coins+=s.truck.value;s.revenue+=s.truck.value;for(const p of Object.keys(PRODUCTS) as Product[])s.delivered[p]+=s.truck.cargo[p];this.emit({kind:'return',text:`Market delivery · +${s.truck.value} coins`});s.truck.value=0;s.truck.cargo=emptyInventory();}}
  while(s.spawned<this.level.bears.length&&s.time>=this.level.bears[s.spawned]){s.spawned++;const x=s.spawned%2?E.field.left+15:E.field.right-15;const y=E.field.top+this.random()*220;s.bears.push({id:this.id(),x,y,hits:0,warning:E.bearWarning,stun:0,caged:false,cageTime:0,attack:E.bearAttack});this.emit({kind:'bear',text:'Bear incoming! Tap it to build a cage.',x,y});}
  updateAnimals(this,dt);updateBears(s,dt,this.emit);
  if(this.level.objectives.every(o=>objectiveProgress(s,o)>=o.amount)){s.complete=true;this.emit({kind:'complete',text:'A beautiful day’s work!'});}
 }
}
