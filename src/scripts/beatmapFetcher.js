define(function(require) {
	"use strict";
	const DatabaseManager = require("./databaseManager.js");
	let mapsLoaded = 0;
	let beatmapsSorted = [];
	let beatMapGroups = [];
	let previous = "";
	let alreadyRefreshing = false;

	class DatabaseData {
		constructor() {
			this.values = [];
			this.complete = false;
		}
	}

	let returns = new DatabaseData();
	let fullyCompletedLoading = false;
	let database = indexedDB.open("osw-database", 4);
	database.addEventListener("upgradeneeded", function(event) {
		console.log("Your current version of the database needs to be updated. Don't worry, It will be updated it automatically");
		let db = event.target.result;
		let expectedStores = ["beatmaps", "audio", "images", "scores", "replays", "skin-elements"];
		for (let i = 0; i < expectedStores.length; i++) {
			if (db.objectStoreNames.contains(expectedStores[i]) === false) {
				db.createObjectStore(expectedStores[i], {
					keyPath: "name",
				});
			}
		}
	});
	return {
		get: function() {
			return beatmapsSorted;
		},
		allMapsLoaded: function() {
			return fullyCompletedLoading;
		},
		refresh: function() {
			if (alreadyRefreshing === false) {
				this.clearMemory();
				fullyCompletedLoading = false;
				let database = indexedDB.open("osw-database");
				database.addEventListener("error", function(event) {
					console.error(`Attempt to open database failed: ${event.target.error}`);
				});
				database.addEventListener("success", function(event) {
					let database = event.target.result;
					DatabaseManager.getAllInDatabase(database, "beatmaps", returns);
					function checkComplete() {
						if (returns.complete && fullyCompletedLoading === false) {
							returns.values.sort(function (a, b) {
								return (a.name > b.name) ? 1 : -1;
							});
							for (let i = 0; i < returns.values.length; i++) {
								let parsedMap = returns.values[i];
								if (i === 0) {
									previous = parsedMap.data.Creator + parsedMap.data.Title;
								}
								/* ignore other gamemodes... for now */
								if (parsedMap.data.Mode !== 0) {
									continue;
								}
								if (beatMapGroups.length !== 0 && parsedMap.data.Creator + parsedMap.data.Title !== previous) {
									beatmapsSorted.push(beatMapGroups);
									beatMapGroups = [];
									previous = parsedMap.data.Creator + parsedMap.data.Title;
								}
								beatMapGroups.push(parsedMap);
							}
							if (beatMapGroups.length >= 1) {
								beatmapsSorted.push(beatMapGroups);
							}
							fullyCompletedLoading = true;
							alreadyRefreshing = false;
						} else {
							setTimeout(checkComplete, 250);
						}
					}
					checkComplete();
				});
			}
		},
		clearMemory() {
			mapsLoaded = 0;
			beatmapsSorted = [];
			beatMapGroups = [];
			previous = "";
			returns = new DatabaseData();
		}
	};
});