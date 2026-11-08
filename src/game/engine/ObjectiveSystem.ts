import type {FarmState,Objective,Product,Species} from '../config/types';
export function objectiveProgress(s:FarmState,o:Objective):number {
 switch(o.type){case 'collect':return s.collected[o.key as Product];case 'produce':return s.produced[o.key as Product];case 'stock':return s.inventory[o.key as Product];case 'deliver':return s.delivered[o.key as Product];case 'balance':return s.coins;case 'revenue':return s.revenue;case 'own':return s.animals.filter(a=>a.species===o.key as Species).length;}
}
export const medalFor=(time:number,gold:number,silver:number):number=>time<=gold?3:time<=silver?2:1;
