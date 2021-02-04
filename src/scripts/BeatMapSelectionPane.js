define(function(require) {
	const utils = require("src/scripts/utils.js")
	const Formulas = require("src/scripts/Formulas.js");
	const StarRating = require("src/scripts/StarRating.js");
	return {
		group: function(maps) {
			let mapsHTML = "";
			let iconsHTML = "";
			for (var i = 0; i < maps.length; i++) {
				iconsHTML += `<img class="beatmap-selection-group-pane-difficulties-icon" src="./src/images/${Formulas.beatmapDifficultyIcon(StarRating.calculate(maps[i]))}-difficulty-icon.png">`
				mapsHTML += this.map(maps[i]);
			}
			return `<div class="beatmap-selection-group">
					<div class="beatmap-selection-group-pane triangle-background">
						<div class="beatmap-selection-group-pane-name">${maps[0].Title}</div>
						<div class="beatmap-selection-group-pane-artist-name">${maps[0].Artist}</div>
						<div>
							<div class="beatmap-selection-group-pane-status">ranked</div>
							<div class="beatmap-selection-group-pane-difficulties-icon-container">
								${iconsHTML}
							</div>
						</div>
					</div>
					${mapsHTML}
				</div>`;
		},
		map: function(beatmap) {
			let starRating = StarRating.calculate(beatmap);
			let stars = "";
			for (var i = 0; i < 10; i++) {
				let size = utils.map(starRating - i, 1, 0, 1, 0.25);
				if (size >= 1) {
					size = 1;
				}
				if (size <= 0.25) {
					size = 0.25;
				}
				stars += `<img style="transform: scale(${size}); opacity: ${size};" class="beatmap-selection-map-pane-star" src="./src/images/star.png">`;
			}
			return `<div class="beatmap-selection-map-pane triangle-background">
					<img class="beatmap-selection-map-pane-difficulty-icon" src="./src/images/${Formulas.beatmapDifficultyIcon(starRating)}-difficulty-icon.png">
					<div class="beatmap-selection-map-pane-right-pane">
						<div class="beatmap-selection-group-map-details">
							<div class="beatmap-selection-group-map-difficulty-name">${beatmap.Version}</div>
							<div class="beatmap-selection-map-pane-mapper-name">mapped by ${beatmap.Creator}</div>
						</div>
						<div class="beatmap-selection-map-pane-stars">
							<div class="beatmap-selection-map-pane-star-wrapper">
								${stars}
							</div>
						</div>
						<div class="beatmap-selection-map-rank"></div>
					</div>
				</div>`;
		},
	};
});