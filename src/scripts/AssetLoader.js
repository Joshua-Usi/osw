define(function(require) {
	"use strict";
	return {
		image: function(src) {
			let image = new Image();
			image.src = src;
			return image;
		},
		audio: function(src) {
			let audio = new Audio();
			audio.src = src;
			return audio;
		},
	};
});