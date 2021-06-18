define(function(require) {
	const StarRating = require("./starRating.js");
	const Formulas = require("./formulas.js");
	const that = {
		generate(maps) {
			let cache = [];
			for (let i = 0; i < maps.length; i++) {
				cache.push(new that.MapSet(maps[i]));
			}
			return cache;
		},
		getCache(cacheName) {
			return JSON.parse(window.localStorage.getItem(cacheName));
		},
		setCache(cacheName, data) {
			window.localStorage.setItem(cacheName, JSON.stringify(data));
		},
		deleteCache(cacheName) {
			window.localStorage.removeItem(cacheName);
		},
		/* 	the beatmap cache is designed to hold data to prevent useless calculations
		 *	with only the bare neccesities to allow for minimal memory usage in local storage
		 */
		MapSet: class MapSet {
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
					this.difficulties.push(new that.Beatmap(mapSet[i]));
				}
				this.difficulties.sort(function(a, b) {
					return a.starRating - b.starRating;
				});
			}
		},
		Beatmap: class Beatmap {
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
		},
	};
	return that;
});