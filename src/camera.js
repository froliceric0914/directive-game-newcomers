const TILE=32;
// Frame the player and the complete nearby shop, including a comfortable margin.
export function cameraFrame(player,shop,viewport){
 let left=player.x*TILE,top=player.y*TILE,right=left+TILE,bottom=top+TILE;
 if(shop){left=Math.min(left,shop.x*TILE);top=Math.min(top,shop.y*TILE);right=Math.max(right,(shop.x+shop.w)*TILE);bottom=Math.max(bottom,(shop.y+shop.h)*TILE);}
 const padding=viewport/2;
 return {padding,left:padding+(left+right)/2-viewport/2,top:padding+(top+bottom)/2-viewport/2,bounds:{left,top,right,bottom}};
}

export function zoomCameraFrame(player,shop,viewport,requestedZoom=1){
 const base=cameraFrame(player,shop,viewport);
 const {left,top,right,bottom}=base.bounds;
 const zoom=Math.min(requestedZoom,(viewport-24)/Math.max(right-left,bottom-top));
 return {zoom,padding:viewport/2,left:(left+right)/2*zoom,top:(top+bottom)/2*zoom};
}
