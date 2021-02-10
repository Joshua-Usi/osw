define(function(require) {
	const utils = require("src/scripts/utils.js")
	const Formulas = require("src/scripts/Formulas.js");
	const StarRating = require("src/scripts/StarRating.js");
	return {
		group: function(maps, i) {
			let mapsHTML = "";
			let iconsHTML = "";
			for (let j = 0; j < maps.length; j++) {
				iconsHTML += `<img class="beatmap-selection-group-pane-difficulties-icon" src="./src/images/${Formulas.beatmapDifficultyIcon(StarRating.calculate(maps[j]))}-difficulty-icon.png">`
				mapsHTML += this.map(maps[j], i, j);
			}
			return `<div class="beatmap-selection-group">
					<div data-audiosource="${maps[0].AudioFilename}" class="beatmap-selection-group-pane triangle-background">
						<div class="beatmap-selection-group-pane-name">${maps[0].Title}</div>
						<div class="beatmap-selection-group-pane-artist-name">${maps[0].Artist}</div>
						<div>
							<div class="beatmap-selection-group-pane-status">ranked</div>
							<div class="beatmap-selection-group-pane-difficulties-icon-container">
								${iconsHTML}
							</div>
						</div>
					</div>
					<div class="beatmap-selection-group-pane-maps" style="display: none;">
						${mapsHTML}
					</div>
				</div>`;
		},
		map: function(beatmap, groupIndex, mapIndex) {
			let starRating = StarRating.calculate(beatmap);
			let stars = "";
			if (starRating <= 10) {
				for (var i = 0; i < 10; i++) {
					let size = utils.map(starRating - i, 1, 0, 1, 0.5);
					if (size >= 1) {
						size = 1;
					}
					if (size <= 0.5) {
						size = 0.5;
					}
					stars += `<img style="transform: scale(${size}); opacity: ${size};" class="beatmap-selection-map-pane-star" src="./src/images/star.png">`;
				}
			} else {
				stars = `<img class="beatmap-selection-map-pane-star" src="./src/images/star.png"><p style="display: inline;">${"x" + (Math.round(starRating * 100) / 100)}</p>`
			}
			return `<div data-groupindex="${groupIndex}" data-map-index="${mapIndex}" class="beatmap-selection-map-pane triangle-background">
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