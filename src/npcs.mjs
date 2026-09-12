import {characters,locations} from './game-data.mjs';
export const npcs=characters;
export const npcVenues=locations.venues;
export function portraitFor(id,variant){const npc=npcs[id];return npc?.portraits[variant??npc.defaultPortrait]??null;}
export function npcsAtLocation(locationId){return Object.values(npcVenues).filter(v=>v.mapLocationId===locationId).flatMap(v=>v.npcIds);}
