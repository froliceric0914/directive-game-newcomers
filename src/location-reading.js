import {locations} from './game-data.js';
export const locationReadings=locations.readings;
export const chapters=locations.chapters;
export function readingForLocation(id){return locationReadings[id]??null;}
