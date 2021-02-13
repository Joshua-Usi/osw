var beautify = require('js-beautify').js;
var fs = require('fs');

let files = [
	"./main.js",
	"./experimental.js",
	"./main.js",
	"./src/scripts/AssetLoader.js",
	"./src/scripts/AttachAudio.js",
	"./src/scripts/BeatMapSelectionPane.js",
	"./src/scripts/Beizer.js",
	"./src/scripts/Canvas.js",
	"./src/scripts/DefaultBeatMaps.js",
	"./src/scripts/DefaultSkin.js",
	"./src/scripts/Formulas.js",
	"./src/scripts/GameplayAssets.js",
	"./src/scripts/HitEvent.js",
	"./src/scripts/HitObject.js",
	"./src/scripts/Keyboard.js",
	"./src/scripts/Mods.js",
	"./src/scripts/Mouse.js",
	"./src/scripts/Options.js",
	"./src/scripts/Parser.js",
	"./src/scripts/Song.js",
	"./src/scripts/StarRating.js",
	"./src/scripts/utils.js",
];
for (var i = 0; i < files.length; i++) {
	fs.readFile(files[i], 'utf8', function (err, data) {
		if (err) {
			throw err;
		}
		console.log(beautify(data, {
			indent_size: 4,
			space_in_empty_paren: true,
			indent_with_tabs: true,
		}));
	});
}