define(function(require) {
	const Parser = require("../../src/scripts/parser.js");
	const starRating = require("../../src/scripts/starRating.js");
	const databaseManager = require("../../src/scripts/databaseManager.js");

	let returns = {
		values: [],
		complete: false,
	};

	let apiKey = "0fa1772fa3f264e1f7a21a68773d4bf3c08caa69";

	function round(num, decimals) {
		return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
	}

	function sortTable() {
		var table, rows, switching, i, x, y, shouldSwitch;
		table = document.querySelector("table");
		switching = true;
		/* Make a loop that will continue until
		no switching has been done: */
		while (switching) {
			// Start by saying: no switching is done:
			switching = false;
			rows = table.rows;
			/* Loop through all table rows (except the
			first, which contains table headers): */
			for (i = 1; i < (rows.length - 1); i++) {
				// Start by saying there should be no switching:
				shouldSwitch = false;
				/* Get the two elements you want to compare,
				one from current row and one from the next: */
				x = rows[i].getElementsByTagName("td")[3];
				y = rows[i + 1].getElementsByTagName("td")[3];
				// Check if the two rows should switch place:
				if (parseFloat(x.innerHTML) > parseFloat(y.innerHTML)) {
				// if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
					// If so, mark as a switch and break the loop:
					shouldSwitch = true;
					break;
				}
			}
			if (shouldSwitch) {
				/* If a switch has been marked, make the switch
				and mark that a switch has been done: */
				rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
				switching = true;
			}
		}
	}

	let fullyCompletedLoading = false;

	let database = indexedDB.open("osw-database");
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
					fetch(`https://osu.ppy.sh/api/get_beatmaps?s=${parsedMap.BeatmapSetID}&bs=${parsedMap.BeatmapID}&k=${apiKey}`).then(function(response) {
						if (response.status !== 200) {
							console.log('Looks like there was a problem. Status Code: ' + response.status);
							return;
						}
						// Examine the text in the response
						response.json().then(function(res) {
							// console.log(`https://osu.ppy.sh/api/get_beatmaps?s=${parsedMap.BeatmapSetID}&bs=${parsedMap.BeatmapID}&k=${apiKey}`);
							let map;
							for (var i = 0; i < res.length; i++) {
								if (parseInt(res[i].beatmap_id) === parsedMap.BeatmapID && parsedMap.Mode === 0) {
									map = res[i];
								}
							}
							if (map) {
								let diff = starRating.calculate(parsedMap);
								let difference = round(map.difficultyrating - diff, 2);
								let tableRow = `<tr>
									<td>${parsedMap.Title} [${parsedMap.Version}]</td>
									<td>${round(map.diff_aim, 2)}</td>
									<td>${round(map.diff_speed, 2)}</td>
									<td>${round(map.difficultyrating, 2)}</td>
									<td>${round(diff, 2)}</td>
									<th style=\"background-color: ${(difference < 0) ? "#0f0" : "#f00"};\">${difference}</td>
								</tr>`;
								document.querySelector("table").innerHTML += tableRow;
								sortTable();
							}
						});
					}).catch(function(err) {
						console.log('Fetch Error', err);
					});
				}
				fullyCompletedLoading = true;
			} else {
				setTimeout(checkComplete, 250);
			}
		}
		checkComplete();
	}
});