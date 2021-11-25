import * as StarRating from "./starRating.js"
import * as Formulas from "./formulas.js"
export function generate(maps) {
	let cache = [];
	for (let i = 0; i < maps.length; i++) {
		cache.push(new MapSet(maps[i]));
	}
	return cache;
}
export function addMapSet(mapset) {
	let cache = getCache("beatmapCache");
	if (cache === null) {
		cache = [];
	}
	cache.push(new MapSet(mapset));
	this.setCache("beatmapCache", cache);
}
export function getCache(cacheName) {
	return JSON.parse(window.localStorage.getItem(cacheName));
}
export function setCache(cacheName, data) {
	window.localStorage.setItem(cacheName, JSON.stringify(data));
}
export function deleteCache(cacheName) {
	window.localStorage.removeItem(cacheName);
}
/* 	the beatmap cache is designed to hold data to prevent useless calculations
 *	with only the bare neccessities to allow for minimal memory usage in local storage
 */
export class MapSet {
	constructor(mapSet) {
		this.audioFilename = mapSet[0].data.AudioFilename;
		this.artist = mapSet[0].data.Artist;
		this.creator = mapSet[0].data.Creator;
		this.title = mapSet[0].data.Title;
		this.tags = mapSet[0].data.Tags;
		this.source = mapSet[0].data.Source;
		this.previewTime = mapSet[0].data.PreviewTime / 1000;
		this.difficulties =  [];
		for (let i = 0; i < mapSet.length; i++) {
			/* "that" is required because of this referencing mixups*/
			this.difficulties.push(new Beatmap(mapSet[i]));
		}
		this.difficulties.sort(function(a, b) {
			return a.starRating - b.starRating;
		});
	}
}
export class Beatmap {
	constructor(beatmap) {
		this.databaseKey = beatmap.name;
		this.version = beatmap.data.Version;
		this.approachRate = beatmap.data.ApproachRate;
		this.circleSize = beatmap.data.CircleSize;
		this.overallDifficulty = beatmap.data.OverallDifficulty
		this.healthDrain = beatmap.data.HPDrainRate;
		this.starRating = StarRating.calculate(beatmap.data);
		this.beatLength = beatmap.data.timingPoints[0].beatLength * 1000;
		this.backgroundFilename = (beatmap.data.background) ? beatmap.data.background.filename : "";
		this.objectCounts = Formulas.getObjectCount(beatmap.data);
		this.drainTime = beatmap.data.hitObjects[beatmap.data.hitObjects.length - 1].time - beatmap.data.hitObjects[0].time;
	}
}