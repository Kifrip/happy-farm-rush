import type {Building,Product} from './types';
export const BUILDINGS:Record<Building,{name:string;short:string;input:Product;output:Product;time:number;x:number;y:number;color:string;upgrade:number}> = {
 powder:{name:'Egg powder mill',short:'Egg mill',input:'egg',output:'powder',time:18,x:132,y:215,color:'#c96b4e',upgrade:110},
 bakery:{name:'Little bakery',short:'Bakery',input:'powder',output:'cake',time:24,x:866,y:215,color:'#d7a057',upgrade:170},
 spinning:{name:'Spinning mill',short:'Spinning mill',input:'wool',output:'thread',time:21,x:125,y:350,color:'#7b9a91',upgrade:150},
 weaving:{name:'Weaving house',short:'Weaving house',input:'thread',output:'cloth',time:27,x:875,y:350,color:'#779eae',upgrade:210},
 churn:{name:'Butter churn',short:'Butter churn',input:'milk',output:'butter',time:23,x:135,y:480,color:'#cfb664',upgrade:190},
 cheese:{name:'Cheese cottage',short:'Cheese cottage',input:'butter',output:'cheese',time:29,x:865,y:480,color:'#b68b62',upgrade:250}
};
