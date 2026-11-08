import type {Upgrade} from './types';
export const UPGRADES:Record<Upgrade,{name:string;description:string;unit:string;costs:number[]}> = {
 well:{name:'Deeper well',description:'More water for a greener pasture.',unit:'+5 water',costs:[2,4,7]},
 refill:{name:'Swift refill',description:'A faster, cheaper turn of the handle.',unit:'−0.7s, −2 coins',costs:[2,4,7]},
 warehouse:{name:'Room to grow',description:'Give every little harvest a home.',unit:'+8 storage',costs:[3,5,8]},
 cargo:{name:'Bigger deliveries',description:'Take more goodness to the market.',unit:'+6 cargo',costs:[2,4,7]},
 truck:{name:'Country express',description:'Less time on the road, more on the farm.',unit:'−2.5s travel',costs:[3,5,8]},
 cage:{name:'Stronger cages',description:'Quicker captures and sturdier bars.',unit:'Fewer clicks / +12s cage',costs:[3,5,8]},
 factory:{name:'Well-oiled machines',description:'A little ingenuity in every workshop.',unit:'15% faster',costs:[3,6,9]},
 batch:{name:'Busy workshops',description:'Make more with each production run.',unit:'+1 batch capacity',costs:[4,7,10]}
};
