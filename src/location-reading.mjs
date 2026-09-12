import {locations} from './game-data.mjs';
export const locationReadings=locations.readings;
export const chapters=locations.chapters;
export function readingForLocation(id){return locationReadings[id]??null;}
