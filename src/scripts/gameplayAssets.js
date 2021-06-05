define(function(require) {
	"use strict";
	function loadImage(src) {
		let image = new Image();
		image.src = src;
		return image;
	}

	return function(skin) {
		return {
			/* cursor assets */
			cursor: loadImage(`./src/images/skins/${skin}/cursor.png`),
			cursorTrail: loadImage(`./src/images/skins/${skin}/cursortrail.png`),
			/* hit circle assets */
			hitCircle: loadImage(`./src/images/skins/${skin}/hitcircle.png`),
			hitCircleOverlay: loadImage(`./src/images/skins/${skin}/hitcircleoverlay.png`),
			approachCircle: loadImage(`./src/images/skins/${skin}/approachcircle.png`),
			/* slider assets */
			sliderBody: loadImage(`./src/images/skins/${skin}/sliderb0.png`),
			sliderFollowCircle: loadImage(`./src/images/skins/${skin}/sliderfollowcircle.png`),
			sliderScorePoint: loadImage(`./src/images/skins/${skin}/sliderscorepoint.png`),
			reverseArrow: loadImage(`./src/images/skins/${skin}/reversearrow.png`),
			/* spinner assets */
			spinnerApproachCircle: loadImage(`./src/images/skins/${skin}/spinner-approachcircle.png`),
			spinnerRPM: loadImage(`./src/images/skins/${skin}/spinner-rpm.png`),
			spinnerTop: loadImage(`./src/images/skins/${skin}/spinner-top.png`),
			spinnerClear: loadImage(`./src/images/skins/${skin}/spinner-clear.png`),
			/* healthbar assets */
			scoreBarBg: loadImage(`./src/images/skins/${skin}/scorebar-bg.png`),
			scoreBarColour: loadImage(`./src/images/skins/${skin}/scorebar-colour.png`),
			/* combo number assets */
			comboNumbers: [
				loadImage(`./src/images/skins/${skin}/fonts/aller/default-0.png`),
				loadImage(`./src/images/skins/${skin}/fonts/aller/default-1.png`),
				loadImage(`./src/images/skins/${skin}/fonts/aller/default-2.png`),
				loadImage(`./src/images/skins/${skin}/fonts/aller/default-3.png`),
				loadImage(`./src/images/skins/${skin}/fonts/aller/default-4.png`),
				loadImage(`./src/images/skins/${skin}/fonts/aller/default-5.png`),
				loadImage(`./src/images/skins/${skin}/fonts/aller/default-6.png`),
				loadImage(`./src/images/skins/${skin}/fonts/aller/default-7.png`),
				loadImage(`./src/images/skins/${skin}/fonts/aller/default-8.png`),
				loadImage(`./src/images/skins/${skin}/fonts/aller/default-9.png`),
			],
			/* hit score number assets */
			scoreNumbers: [
				loadImage(`./src/images/skins/${skin}/hit300.png`),
				loadImage(`./src/images/skins/${skin}/hit100.png`),
				loadImage(`./src/images/skins/${skin}/hit50.png`),
				loadImage(`./src/images/skins/${skin}/hit0.png`),
			],
		}
	};
});