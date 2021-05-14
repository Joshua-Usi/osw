define(function(require) {
	const Parser = require("./parser.js");
	const databaseManager = require("./databaseManager.js");
	const starRating = require("src/scripts/starRating.js");
	let fetchedMaps = [];
	let mapsLoaded = 0;
	let beatmapsSorted = [];
	let beatMapGroups = [];
	let previous = "";

	let returns = {
		values: [],
		complete: false,
	};
	let fullyCompletedLoading = false;

	let database = indexedDB.open("osw-database", 2);
	database.addEventListener("upgradeneeded", function(event) {
		console.log("A new version of the database exists and will need to be updated");
		let db = event.target.result;
		if (db.objectStoreNames.contains("beatmaps") === false) {
			db.createObjectStore("beatmaps", {
				keyPath: "name"
			});
		}
		if (db.objectStoreNames.contains("audio") === false) {
			db.createObjectStore("audio", {
				keyPath: "name"
			});
		}
		if (db.objectStoreNames.contains("scores") === false) {
			db.createObjectStore("scores", {
				keyPath: "name"
			});
		}
	});
	database.addEventListener("error", function(event) {
		console.error(`Attempt to open database failed: ${event.target.error}`);
	});
	database.addEventListener("success", function(event) {
		let database = event.target.result;
		fetchMaps(database);
	});
	async function fetchMaps(database) {
		databaseManager.getAllInDatabase(database, "beatmaps", returns);
		function checkComplete() {
			if (returns.complete && fullyCompletedLoading === false) {
				for (let i = 0; i < returns.values.length; i++) {
					let parsedMap = returns.values[i].data;
					if (i === 0) {
						previous = parsedMap.Creator + parsedMap.Title;
					}
					/* ignore other gamemodes... for now */
					if (parsedMap.Mode !== 0) {
						continue;
					}
					if (beatMapGroups.length !== 0 && parsedMap.Creator + parsedMap.Title !== previous) {
						beatMapGroups.sort(function(a, b) {
							return starRating.calculate(a) - starRating.calculate(b);
						});
						beatmapsSorted.push(beatMapGroups);
						beatMapGroups = [];
						previous = parsedMap.Creator + parsedMap.Title;
					}
					beatMapGroups.push(parsedMap);
				}
				if (beatMapGroups.length >= 1) {
					beatmapsSorted.push(beatMapGroups);
				}
				fullyCompletedLoading = true;
			} else {
				setTimeout(checkComplete, 250);
			}
		}
		checkComplete();
	}
	return {
		get: function() {
			return beatmapsSorted;
		},
		allMapsLoaded: function() {
			return fullyCompletedLoading;
		},
		refresh: function() {
			mapsLoaded = 0;
			beatmapsSorted = [];
			beatMapGroups = [];
			previous = "";

			returns = {
				values: [],
				complete: false,
			};
			fullyCompletedLoading = false;
			let database = indexedDB.open("osw-database");
			database.addEventListener("error", function(event) {
				console.error(`Attempt to open database failed: ${event.target.error}`);
			});
			database.addEventListener("success", function(event) {
				let database = event.target.result;
				fetchMaps(database);
			});
		},
		checkForNewMaps: function(beatmapQueue) {
			let database = indexedDB.open("osw-database");
			database.addEventListener("error", function(event) {
				console.error(`Attempt to open database failed: ${event.target.error}`);
			});
			database.addEventListener("success", function(event) {
				let database = event.target.result;
				if (beatmapQueue.length > 0) {
					while (beatmapQueue.length > 0) {
						if (beatmapQueue[0].type === "beatmap") {
							console.log("Adding beatmaps");
							databaseManager.addToDatabase(database, "beatmaps", beatmapQueue[0].name, Parser.parseBeatmap(beatmapQueue[0].data));
							fetchedMaps.push(beatmapQueue[0].data);
						} else if (beatmapQueue[0].type === "audio") {
							console.log("Adding audio");
							databaseManager.addToDatabase(database, "audio", beatmapQueue[0].name, beatmapQueue[0].data);
						}
						beatmapQueue.splice(0, 1);
					}
				}
			});
		}
	};
});