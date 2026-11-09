import type {FarmState,Progress,Upgrade} from '../config/types';
import {emptyUpgrades} from '../config/economy';
import {LEVELS} from '../config/levels';
import {UPGRADES} from '../config/upgrades';
import {medalFor} from '../engine/ObjectiveSystem';
import {validateSave} from './SaveValidation';
export const SAVE_KEY='happy-farm-rush-v1';
export const newProgress=():Progress=>({version:1,unlocked:1,stars:0,spent:0,totalEarned:0,best:{},upgrades:emptyUpgrades(),settings:{language:'ru',sound:0.75,music:0.05,muted:false,effects:true,reducedMotion:typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches},achievements:[],active:null});
export function parseSave(raw:string):Progress {if(raw.length>2000000)throw new Error('Save file is too large.');const v:unknown=JSON.parse(raw);if(v&&typeof v==='object'&&'settings' in v&&v.settings&&typeof v.settings==='object'&&!('language' in v.settings))Object.assign(v.settings,{language:'ru'});if(!validateSave(v))throw new Error('This is not a valid Happy Farm Rush v1 save.');if(v.settings.sound===0.45&&v.settings.music===0.12){v.settings.sound=0.75;v.settings.music=0.05;}return v;}
export class SaveManager {
 progress:Progress;error='';
 constructor(private storage:Pick<Storage,'getItem'|'setItem'|'removeItem'>|null=typeof localStorage==='undefined'?null:localStorage){this.progress=newProgress();try{const raw=storage?.getItem(SAVE_KEY);if(raw)this.progress=parseSave(raw);}catch{this.error='Your save could not be loaded. Export it before resetting; a new game is ready.';}}
 save():boolean{try{this.storage?.setItem(SAVE_KEY,JSON.stringify(this.progress));this.error='';return true;}catch{this.error='Saving is unavailable. Export your progress from Settings.';return false;}}
 snapshot(s:FarmState):void{this.progress.active=structuredClone(s);this.save();}
 complete(s:FarmState):{medal:number;earned:number} {
  if(!s.complete)return {medal:0,earned:0};const l=LEVELS[s.level-1],medal=medalFor(s.time,l.gold,l.silver);const previous=this.progress.best[s.level];
  const earned=Math.max(0,medal-(previous?.medal??0));
  this.progress.best[s.level]={time:Math.min(previous?.time??Infinity,s.time),medal:Math.max(previous?.medal??0,medal)};
  this.progress.stars+=earned;this.progress.totalEarned+=earned;this.progress.unlocked=Math.max(this.progress.unlocked,Math.min(20,s.level+1));this.progress.active=null;
  if(s.level===20&&!this.progress.achievements.includes('A bountiful life'))this.progress.achievements.push('A bountiful life');
  if(medal===3&&!this.progress.achievements.includes('Golden beginnings'))this.progress.achievements.push('Golden beginnings');this.save();return {medal,earned};
 }
 purchase(key:Upgrade):boolean{const level=this.progress.upgrades[key],cost=UPGRADES[key].costs[level];if(cost===undefined||this.progress.stars<cost)return false;this.progress.stars-=cost;this.progress.spent+=cost;this.progress.upgrades[key]++;this.save();return true;}
 import(raw:string):void{this.progress=parseSave(raw);this.save();}
 reset():void{this.progress=newProgress();this.save();}
}
