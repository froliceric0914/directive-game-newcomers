// Logical tiles preserve collision rules; drawing interpolates between them.
export function createMovement(start,step,onArrive){
 let position={...start},visual={...start},motion=null;
 const held=new Map();
 function move(direction,now){if(motion)return;const next=step(position,...direction);if(next!==position)motion={from:position,to:next,time:now};}
 return {
  get position(){return position},get visual(){return visual},get moving(){return !!motion},
  press(id,direction,now){held.set(id,direction);move(direction,now)},
  release(id){held.delete(id)},
  clear(){held.clear()},
  reset(){held.clear();motion=null;position={...start};visual={...start}},
  tick(now){
   if(motion){const t=Math.min(1,(now-motion.time)/150);visual={x:motion.from.x+(motion.to.x-motion.from.x)*t,y:motion.from.y+(motion.to.y-motion.from.y)*t};
    if(t===1){position=motion.to;motion=null;onArrive(position)}
   }
   if(!motion&&held.size)move([...held.values()].at(-1),now);
   return visual;
  }
 };
}
