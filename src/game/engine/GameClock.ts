import {ECONOMY} from '../config/economy';
export class GameClock {
 private accumulator=0;
 advance(delta:number,step:()=>void,paused=false):void {
  if(paused){this.accumulator=0;return;}
  this.accumulator+=Math.min(Math.max(delta,0),ECONOMY.step*ECONOMY.maxSteps);
  let n=0;while(this.accumulator+1e-9>=ECONOMY.step&&n++<ECONOMY.maxSteps){step();this.accumulator-=ECONOMY.step;}
 }
 reset():void{this.accumulator=0;}
}
