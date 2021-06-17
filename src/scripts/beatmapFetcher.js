define(function(require) {
	"use strict";
	const DatabaseManager = require("./databaseManager.js");
	let fetchedMaps = [];
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
	let database = indexedDB.open("osw-database", 3);
	database.addEventListener("upgradeneeded", function(event) {
		console.log("Your current version of the database needs to be updated. Don't worry, I will update it automatically");
		let db = event.target.result;
		if (db.objectStoreNames.contains("beatmaps") === false) {
			db.createObjectStore("beatmaps", {
				keyPath: "name",
			});
		}
		if (db.objectStoreNames.contains("audio") === false) {
			db.createObjectStore("audio", {
				keyPath: "name",
			});
		}
		if (db.objectStoreNames.contains("scores") === false) {
			db.createObjectStore("scores", {
				keyPath: "name",
			});
		}
		if (db.objectStoreNames.contains("images") === false) {
			db.createObjectStore("images", {
				keyPath: "name",
			});
		}
		if (db.objectStoreNames.contains("skin-elements") === false) {
			db.createObjectStore("skin-elements", {
				keyPath: "name",
			});
		}
	});

	function fetchMaps(database) {
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
	}
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
					fetchMaps(database);
				});
			}
		},
		addNewMaps: function(beatmapQueue) {
			let database = indexedDB.open("osw-database");
			database.addEventListener("error", function(event) {
				console.error(`Attempt to open database failed: ${event.target.error}`);
			});
			database.addEventListener("success", function(event) {
				let database = event.target.result;
				while (beatmapQueue.length > 0) {
					DatabaseManager.addToDatabase(database, "beatmaps", beatmapQueue[0].name, beatmapQueue[0].data);
					fetchedMaps.push(beatmapQueue[0].data);
					beatmapQueue.splice(0, 1);
				}
			});
		},
		addAudio: function(audioQueue) {
			let database = indexedDB.open("osw-database");
			database.addEventListener("error", function(event) {
				console.error(`Attempt to open database failed: ${event.target.error}`);
			});
			database.addEventListener("success", function(event) {
				let database = event.target.result;
				while (audioQueue.length > 0) {
					DatabaseManager.addToDatabase(database, "audio", audioQueue[0].name, audioQueue[0].data);
					audioQueue.splice(0, 1);
				}
			});
		},
		addImage: function(imageQueue) {
			let database = indexedDB.open("osw-database");
			database.addEventListener("error", function(event) {
				console.error(`Attempt to open database failed: ${event.target.error}`);
			});
			database.addEventListener("success", function(event) {
				let database = event.target.result;
				while (imageQueue.length > 0) {
					DatabaseManager.addToDatabase(database, "images", imageQueue[0].name, imageQueue[0].data);
					imageQueue.splice(0, 1);
				}
			});
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