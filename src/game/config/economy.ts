import type { Inventory, Upgrades } from './types';
export const ECONOMY = {step:1/20,maxSteps:8,width:1000,height:650,field:{left:210,right:790,top:165,bottom:505},waterCapacity:12,waterCost:12,refillTime:4,grassFood:28,grassLimit:32,expiration:65,expirationWarning:14,warehouse:16,truckCapacity:12,travel:15,cageDuration:35,bearValue:90,bearSlots:5,bearSpeed:27,bearWarning:5,bearAttack:5,starvation:190,hungerWarning:70,hungerStop:87,eatRate:13,feedRate:17} as const;
export const emptyInventory = ():Inventory => ({egg:0,powder:0,cake:0,wool:0,thread:0,cloth:0,milk:0,butter:0,cheese:0,bear:0});
export const emptyUpgrades = ():Upgrades => ({well:0,refill:0,warehouse:0,cargo:0,truck:0,cage:0,factory:0,batch:0});
