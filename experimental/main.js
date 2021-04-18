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
}

beatmapQueue = [];

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
						beatmapQueue.push({type: "beatmap", name: key, data: content});
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
					beatmapQueue.push({type: "audio", name: beatmapSetId + audioKey, data: btoa(content)});
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

let database = indexedDB.open("", 1);
database.addEventListener("upgradeneeded", function() {
	console.log("A new version of the database exists and will need to be updated");
	 let db = event.target.result;
	 // existing db version
	 switch (event.oldVersion) {
		case 0:
			db.createObjectStore("beatmaps", {keyPath: "name"});
			db.createObjectStore("audio", {keyPath: "name"});
	}
});

database.addEventListener("error", function(event) {
	console.error("Error " + event.target.error);
});

database.addEventListener("success", function(event) {
	console.log("Success");
	let database = event.target.result;

	function checkForNewMaps() {
		if (beatmapQueue.length > 0) {
			while (beatmapQueue.length > 0) {
				if (beatmapQueue[0].type === "beatmap") {
					add(database, "beatmaps", beatmapQueue[0].name, beatmapQueue[0].data);
				} else if (beatmapQueue[0].type === "audio") {
					add(database, "audio", beatmapQueue[0].name, beatmapQueue[0].data);
				}
				beatmapQueue.splice(0, 1);
			}
		} else {
			console.log(all(database, "v"));
		}
	}
	setInterval(checkForNewMaps, 1000);
	// continue working with database using db object
});

function add(database, store, key, data) {
	let object = {
		name: key,
		data: data,
	};
	let objectStore = getObjectStore(database, store, "readwrite");
	let request;
	try {
		request = objectStore.add(object);
	} catch (e) {
		throw e;
	}
	request.addEventListener("error", function () {
		console.log("Insertion in DB Failed ", this.error);
	});
}

function all(database, store) {
	let objectStore = getObjectStore(database, store, "readonly");
	return objectStore.getAll().result;
}