export interface FarmPresentation {height:number;verticalScale:number;entityScale:number}
// Adapt the view, not the authoritative world: all 20 levels retain their simulation coordinates.
export function farmPresentation(width:number,height:number,compact:boolean):FarmPresentation {
 const logicalHeight=compact?1000*Math.max(1,height)/Math.max(1,width):650;
 return {height:logicalHeight,verticalScale:logicalHeight/650,entityScale:Math.min(1,logicalHeight/650)};
}

export interface ScreenRect {x:number;y:number;width:number;height:number}
export function rectsOverlap(a:ScreenRect,b:ScreenRect,gap=0):boolean{return a.x<b.x+b.width+gap&&a.x+a.width+gap>b.x&&a.y<b.y+b.height+gap&&a.y+a.height+gap>b.y;}
// Fit a roadside sprite between the pasture and any HUD cards crossing its horizontal span.
export function fitRoadsideSprite(sprite:ScreenRect,hud:ScreenRect[],fieldBottom:number,height:number,gap=8):ScreenRect {
 const centerX=sprite.x+sprite.width/2;
 const blockers=hud.filter(r=>r.y>fieldBottom&&r.x<centerX+sprite.width/2+gap&&r.x+r.width>centerX-sprite.width/2-gap);
 const bottom=Math.min(height-gap,...blockers.map(r=>r.y-gap)),top=fieldBottom+gap;
 const factor=Math.min(1,Math.max(1,bottom-top)/sprite.height),h=sprite.height*factor,w=sprite.width*factor;
 const centerY=Math.max(top+h/2,Math.min(sprite.y+sprite.height/2,bottom-h/2));
 return {x:centerX-w/2,y:centerY-h/2,width:w,height:h};
}
export const HUD_SELECTORS='.farm-heading>div:first-child,.farm-stats .stat,.farm-stats>button,.objective,.farm-controls>button,.animal-menu-button,.animal-buy';
export function farmHudRects(root:HTMLElement,canvas:HTMLCanvasElement):ScreenRect[]{
 const area=canvas.getBoundingClientRect(),result:ScreenRect[]=[];
 for(const element of root.querySelectorAll<HTMLElement>(HUD_SELECTORS)){
  const rect=element.getBoundingClientRect();if(rect.width===0||rect.height===0)continue;
  const clip=element.closest('.objectives')?.getBoundingClientRect();
  const left=Math.max(rect.left,area.left,clip?.left??-Infinity),right=Math.min(rect.right,area.right,clip?.right??Infinity);
  const top=Math.max(rect.top,area.top,clip?.top??-Infinity),bottom=Math.min(rect.bottom,area.bottom,clip?.bottom??Infinity);
  if(right>left&&bottom>top)result.push({x:left-area.left,y:top-area.top,width:right-left,height:bottom-top});
 }
 return result;
}
