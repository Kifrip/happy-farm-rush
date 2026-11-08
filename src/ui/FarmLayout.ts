export interface FarmPresentation {height:number;verticalScale:number;entityScale:number}
// Adapt the view, not the authoritative world: all 20 levels retain their simulation coordinates.
export function farmPresentation(width:number,height:number,compact:boolean):FarmPresentation {
 const logicalHeight=compact?1000*Math.max(1,height)/Math.max(1,width):650;
 return {height:logicalHeight,verticalScale:logicalHeight/650,entityScale:Math.min(1,logicalHeight/650)};
}
