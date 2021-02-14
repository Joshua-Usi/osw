var beautify = require('js-beautify').js;
var fs = require('fs');

let files = [
	"./main.js",
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
	"./src/scripts/gameplay.js",
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
let beautifiedFiles = [];

for (var i = 0; i < files.length; i++) {
	let data = fs.readFileSync(files[i], {encoding:'utf8', flag:'r'});
	beautifiedFiles.push(beautify(data, {
		indent_size: 4,
		indent_with_tabs: true,
	}));
}
for (var i = 0; i < files.length; i++) {
	fs.writeFileSync(files[i], beautifiedFiles[i], {encoding:'utf8', flag:'w'});
	console.log("Successfully beautified file " + files[i]);
}