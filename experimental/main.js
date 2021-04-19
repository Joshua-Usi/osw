//Simple function to get the ObjectStore
//Provide the ObjectStore name and the mode ('readwrite')
function getObjectStore(database, store, mode) {
	let transaction = database.transaction(store, mode);
	return transaction.objectStore(store);
}
let parser = {
	parseBeatMap: function(data) {
		let splited = data.split("\n");
		// if (splited[0] !== "osu file format v14") {
		// console.warn("Currently parsed beatmap uses \"" + splited[0] + "\" which may be incompatible with the current parser");
		// }
		let beatmap = {
			version: splited[0],
			hitObjects: [],
			timingPoints: [],
			comboColours: [],
		};
		let section = "";
		/* start from 1 to ignore version */
		let len = splited.length;
		for (var i = 1; i < len; i++) {
			if (splited[i] === "" || splited[i].substr(0, 2) === "//") {
				continue;
			}
			if (splited[i][0] === "[") {
				section = splited[i].replace(/[\n\r]/g, "");
				continue;
			}
			let l = splited[i].split(/:(.+)/);
			if (l.length === 1) {
				continue;
			}
			if (l[0] === "AudioFilename") {
				if (l[1].substr(0, 1) === " ") {
					l[1] = l[1].substr(1);
				}
				beatmap[l[0]] = l[1];
				continue;
			}
			if (isNaN(parseFloat(l[1]))) {
				if (l[1].substr(0, 1) === " ") {
					l[1] = l[1].substr(1);
				}
				beatmap[l[0]] = l[1];
			} else {
				beatmap[l[0]] = parseFloat(l[1]);
			}
		}
		return beatmap;
	},
};
let beatmapQueue = [];
document.getElementById("beatmap").addEventListener("change", function() {
	let fileReader = new FileReader();
	fileReader.onload = function() {
		let new_zip = new JSZip();
		new_zip.loadAsync(event.target.result).then(function(zip) {
			let numberOfValidFiles = 0;
			let audioKey;
			let beatmapSetId;
			for (let key in zip.files) {
				if (key.includes(".mp3") || key.includes(".ogg")) {
					audioKey = key;
				} else if (key.includes(".osu")) {
					zip.files[key].async("string").then(function(content) {
						if (beatmapSetId === undefined) {
							beatmapSetId = parser.parseBeatMap(content).BeatmapSetID;
						}
						beatmapQueue.push({
							type: "beatmap",
							name: key,
							data: content
						});
					});
					numberOfValidFiles++;
				}
			}
			if (audioKey) {
				zip.files[audioKey].async("binarystring").then(function(content) {
					let audio = document.getElementById("audio");
					let audioType;
					if (audioKey.includes(".mp3")) {
						audioType = "mp3";
					} else if (audioKey.includes(".ogg")) {
						audioType = "ogg";
					}
					audio.src = `data:audio/${audioType};base64,${btoa(content)}`;
					audio.play();
					beatmapQueue.push({
						type: "audio",
						name: beatmapSetId + audioKey,
						data: btoa(content)
					});
					numberOfValidFiles++;
				});
			}
			if (numberOfValidFiles === 0) {
				console.warn("Invalid osu beatmap");
			}
		});
	};
	fileReader.readAsBinaryString(this.files[0]);
});
if (!window.indexedDB) {
	console.warn("IndexedDB is not supported on your browser, this means you will be unable to save beatmaps");
}
let database = indexedDB.open("osw-database", 1);
database.addEventListener("upgradeneeded", function() {
	console.log("A new version of the database exists and will need to be updated");
	let db = event.target.result;
	// existing db version
	switch (event.oldVersion) {
		case 0:
			db.createObjectStore("beatmaps", {
				keyPath: "name"
			});
			db.createObjectStore("audio", {
				keyPath: "name"
			});
			break;
	}
});
database.addEventListener("error", function(event) {
	console.error(`Attempt to open database failed: ${event.target.error}`);
});
database.addEventListener("success", function(event) {
	let database = event.target.result;
	let returns = {
		values: [],
		complete: false,
	};

	function checkForNewMaps() {
		if (beatmapQueue.length > 0) {
			while (beatmapQueue.length > 0) {
				if (beatmapQueue[0].type === "beatmap") {
					addToDatabase(database, "beatmaps", beatmapQueue[0].name, beatmapQueue[0].data);
				} else if (beatmapQueue[0].type === "audio") {
					addToDatabase(database, "audio", beatmapQueue[0].name, beatmapQueue[0].data);
				}
				beatmapQueue.splice(0, 1);
			}
		}
		let d = document.getElementById("d");
		if (returns.complete) {
			let d = document.getElementById("d");
			let content = "";
			for (let i = 0; i < returns.values.length; i++) {
				content += returns.values[i].name + "<br>";
			}
			d.innerHTML = content;
		} else {
			d.innerHTML = "Loading maps";
		}
	}
	getAllInDatabase(database, "beatmaps", returns);
	setInterval(checkForNewMaps, 1000);
	// continue working with database using db object
});

function addToDatabase(database, store, key, data) {
	let object = {
		name: key,
		data: data,
	};
	let objectStore = getObjectStore(database, store, "readwrite");
	let request;
	request = objectStore.add(object);
	request.addEventListener("error", function(event) {
		console.error(`Attempt to insert into object store ${store} failed: ${event.target.error}`);
	});
}

function getAllInDatabase(database, store, asyncReturns) {
	let objectStore = getObjectStore(database, store, "readonly");
	let request = objectStore.openCursor();
	request.addEventListener("error", function(event) {
		console.error(`Attempt to fetch data from object store ${store} failed: ${event.target.error}`);
	});
	request.addEventListener("success", function(event) {
		let cursor = event.target.result;
		if (cursor) {
			let value = cursor.value;
			asyncReturns.values.push(value);
			cursor.continue();
		} else {
			asyncReturns.complete = true;
		}
	});
}