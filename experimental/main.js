function formatDate(day, month, year, hour, minute) {
	let monthWords = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];
	if (hour.toString().length === 1) {
		hour = "0" + hour;
	}
	if (minute.toString().length === 1) {
		minute = "0" + minute;
	}
	return `${day} ${monthWords[month]} ${year} ${hour}:${minute}`; 
}

let date = new Date();
let playDetails = {
	mapName: "In my room",
	mapperName: "Aka",
	artist: "FELT",
	difficultyName: "Tranquility",
	score: 1203020,
	accuracy: 97.4565,
	maxCombo: 147,
	fc: "PERFECT",
	grade: "x",
	unstableRate: 143,
	pp: 88,
	hitDetails: {
		total300: 147,
		total100: 0,
		total50: 0,
		totalMiss: 0,
		totalSliderHeads: 0,
		hitSliderHeads: 50,
		totalSliderEnds: 50,
		hitSliderEnds: 0,
		totalSliderRepeats: 0,
		hitSliderRepeats: 0,
		totalSliderTicks: 0,
		hitSliderTicks: 0,
		totalSpinnerSpins: 0,
		totalSpinnerBonusSpin: 0,
		comboBreaks: 0,
	},
	mods: {},
	datePlayed: formatDate(date.getDate(), date.getMonth(), date.getFullYear(), date.getHours(), date.getMinutes()),
	replay: "TODO",
};


function displayEndResults(playDetails) {
	document.getElementById("end-results-map-name").textContent = playDetails.mapName;
	document.getElementById("end-results-artist-name").textContent = playDetails.artist;
	document.getElementById("end-results-grade").src = `../src/images/${playDetails.grade}-rank-icon.png`;
	document.getElementById("end-results-score").textContent = Number(playDetails.score).toLocaleString();
	document.getElementById("end-results-accuracy-bar").style.width = playDetails.accuracy + "%";
	document.getElementById("end-results-accuracy-bar").textContent = playDetails.accuracy.toFixed(2) + "%";
	document.getElementById("end-results-difficulty-name").textContent = playDetails.difficultyName;
	document.getElementById("end-results-mapper-name").textContent = `Mapped by ${playDetails.mapperName}`;
	document.getElementById("end-results-accuracy-header").textContent = playDetails.accuracy.toFixed(2) + "%";
	document.getElementById("end-results-max-combo").textContent = playDetails.maxCombo;
	document.getElementById("end-results-combo-type").textContent = playDetails.fc;
	document.getElementById("end-results-pp").textContent = Math.round(playDetails.pp);
	document.getElementById("end-results-great").textContent = playDetails.hitDetails.total300;
	document.getElementById("end-results-ok").textContent = playDetails.hitDetails.total100;
	document.getElementById("end-results-meh").textContent = playDetails.hitDetails.total50;
	document.getElementById("end-results-miss").textContent = playDetails.hitDetails.totalMiss;
	document.getElementById("end-results-slider-ends").textContent = playDetails.hitDetails.hitSliderEnds + "/" + playDetails.hitDetails.totalSliderEnds;
	document.getElementById("end-results-unstable-rate").textContent = Math.round(playDetails.unstableRate);
	document.getElementById("end-results-combo-breaks").textContent = playDetails.hitDetails.comboBreaks;
	document.getElementById("end-results-date-played").textContent = "Played on " + playDetails.datePlayed;
}

displayEndResults(playDetails);