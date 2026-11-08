import type {Progress} from '../config/types';
import {ANIMALS} from '../config/animals';
import {PRODUCTS} from '../config/products';
import {BUILDINGS} from '../config/buildings';
import {UPGRADES} from '../config/upgrades';
const obj=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const num=(v:unknown,max=1e9):v is number=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=max;
const int=(v:unknown,max=1e9):v is number=>num(v,max)&&Number.isInteger(v);
const point=(v:Record<string,unknown>)=>num(v.x,1100)&&num(v.y,750);
const inventory=(v:unknown)=>obj(v)&&Object.keys(PRODUCTS).every(k=>int(v[k],100000));
const upgrades=(v:unknown)=>obj(v)&&Object.keys(UPGRADES).every(k=>int(v[k],3));
export function validateSave(value:unknown):value is Progress {
 if(!obj(value)||value.version!==1||!int(value.unlocked,20)||value.unlocked<1||!int(value.stars,1000)||!int(value.spent,1000)||!int(value.totalEarned,1000)||value.stars+value.spent!==value.totalEarned||!upgrades(value.upgrades)||!obj(value.settings)||!obj(value.best)||!Array.isArray(value.achievements)||!value.achievements.every(a=>typeof a==='string'&&a.length<100))return false;
 const settings=value.settings;if(settings.language!=='ru'&&settings.language!=='en')return false;if(!num(settings.sound,1)||!num(settings.music,1)||typeof settings.muted!=='boolean'||typeof settings.effects!=='boolean'||typeof settings.reducedMotion!=='boolean')return false;
 if(!Object.entries(value.best).every(([k,b])=>int(Number(k),20)&&Number(k)>=1&&obj(b)&&num(b.time)&&int(b.medal,3)&&b.medal>=1))return false;
 if(value.active===null)return true;
 const s=value.active;if(!obj(s)||!int(s.level,20)||s.level<1||s.level>value.unlocked||!int(s.seed,4294967295)||!int(s.nextId)||!num(s.time)||!num(s.coins)||!num(s.water,27)||!num(s.refill,4)||!num(s.revenue)||!int(s.spawned,1000)||!int(s.lost)||typeof s.complete!=='boolean'||!upgrades(s.upgrades))return false;
 if(!['inventory','collected','produced','delivered'].every(k=>inventory(s[k])))return false;
 if(!Array.isArray(s.animals)||s.animals.length>100||!s.animals.every(a=>obj(a)&&int(a.id)&&typeof a.species==='string'&&a.species in ANIMALS&&point(a)&&obj(a.target)&&point(a.target)&&num(a.hunger,500)&&num(a.cooldown,60)&&num(a.bark,20)&&num(a.warning,100)&&['idle','wandering','seeking','eating','producing','fleeing','stunned'].includes(String(a.state))))return false;
 if(!Array.isArray(s.grass)||s.grass.length>32||!s.grass.every(g=>obj(g)&&int(g.id)&&point(g)&&num(g.food,28)&&num(g.age)))return false;
 if(!Array.isArray(s.drops)||s.drops.length>1000||!s.drops.every(d=>obj(d)&&int(d.id)&&point(d)&&typeof d.kind==='string'&&d.kind in PRODUCTS&&num(d.age,65)))return false;
 if(!Array.isArray(s.bears)||s.bears.length>100||!s.bears.every(b=>obj(b)&&int(b.id)&&point(b)&&int(b.hits,3)&&num(b.warning,5)&&num(b.stun,4)&&typeof b.caged==='boolean'&&num(b.cageTime,71)&&num(b.attack,5)))return false;
 if(!Array.isArray(s.machines)||s.machines.length>6||!s.machines.every(m=>obj(m)&&typeof m.kind==='string'&&m.kind in BUILDINGS&&int(m.level,3)&&m.level>=1&&num(m.remaining,30)&&num(m.duration,30)&&int(m.batch,6)))return false;
 if(!obj(s.truck)||!num(s.truck.remaining,15)||!num(s.truck.duration,15)||!num(s.truck.value)||!inventory(s.truck.cargo))return false;
 const ids=[...s.animals,...s.grass,...s.drops,...s.bears].map(v=>(v as Record<string,unknown>).id as number);
 return new Set(ids).size===ids.length&&ids.every(id=>id<(s.nextId as number));
}
