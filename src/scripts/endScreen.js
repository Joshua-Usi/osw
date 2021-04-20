define(function(require) {
	return {
		displayResults: function(playDetails) {
			document.getElementById("end-results-map-name").textContent = playDetails.mapName;
			document.getElementById("end-results-artist-name").textContent = playDetails.artist;
			document.getElementById("end-results-grade").src = `./src/images/rank-icons/${playDetails.grade}-rank.png`;
			document.getElementById("end-results-score").textContent = Number(Math.round(playDetails.score)).toLocaleString();
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
	}
});