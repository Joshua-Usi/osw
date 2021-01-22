define(function(require) {
	return {
		Audio: {
			musicVolume: 1,
			effectVolume: 1,
		},
		Inputs: {
			keyBind1: "z",
			keyBind2: "x",
			allowMouseClicks: true,
		},
		Performance: {
			useLowPower: false,
			// Amount of points to skip when drawing sliders
			sliderDetail: 1,
			drawHitValues: true,
			drawComboNumbers: true,
			drawHitCircleOverlay: true,
		},
		Gameplay: {
			draw300HitValue: true,
		},
		Skin: {},
	}
});
