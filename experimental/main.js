document.getElementById("beatmap").addEventListener("change", function() {
	let fileReader = new FileReader();
	fileReader.onload = function() {
		var new_zip = new JSZip();
		new_zip.loadAsync(this.result).then(function(zip) {
			let numberOfValidFiles = 0;
			for (let key in zip.files) {
				if (key.includes(".mp3") || key.includes(".ogg")) {
					zip.files[key].async("binarystring").then(function(content) {
						let audio = document.getElementById("audio");
						let audioType;
						if (key.includes(".mp3")) {
							audioType = "mp3";
						} else if (key.includes(".ogg")) {
							audioType = "ogg";
						}
						audio.src = `data:audio/${audioType};base64,${btoa(content)}`;
						audio.play();
						numberOfValidFiles++;
					});
				} else if (key.includes(".osu")) {
					zip.files[key].async("string").then(function(content) {
						console.log("Length as string " + content.length);
					});
					numberOfValidFiles++;
				}
			}
			if (numberOfValidFiles === 0) {
				console.warn("Invalid osu beatmap");
			}
		});
	};
	fileReader.readAsBinaryString(this.files[0]);
});

let beatmapDatabase = indexedDB.open("beatmap-database", 1);

beatmapDatabase.addEventListener("upgradeneeded", function(event) {
	console.log("A new version of the database exists and will need to be updated");
	 let db = openRequest.result
	 // existing db version
	 switch (event.oldVersion) {
		case 0:
			// version 0 means that the client had no database
			// perform initialization
	}
});

beatmapDatabase.addEventListener("error", function() {
	console.error("Error " + beatmapDatabase.error);
});

beatmapDatabase.addEventListener("success", function() {
	console.log("Success");
	let db = beatmapDatabase.result;
	console.log(db);
	// continue working with database using db object
});