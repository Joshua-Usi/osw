function parseBeatMap(data) {
	let splited = data.split("\n");
	let beatmap = {
		version: splited[0],
		hitObjects: [],
		hitObjectsParsed: [],
	}
	/* start from 1 to ignore version */
	for (var i = 1; i < splited.length; i++) {
		if (splited[i] === "" || splited[i].substr(0, 2) === "//") {
			continue;
		}
		let l = splited[i].split(/:(.+)/);
		if (l.length === 1) {
			continue;
		}
		if (/\d/.test(l[0])) {
			beatmap.hitObjects.push(splited[i]);
			beatmap.hitObjectsParsed.push(parseHitObject(splited[i]));
			beatmap.hitObjectsParsed[beatmap.hitObjectsParsed.length - 1].time -= AR(beatmap.ApproachRate);
			continue;
		}
		if (isNaN(parseFloat(l[1]))) {
			if (l[1].substr(0, 1) === " ") {
				l[1] = l[1].substr(1);
			}
			beatmap[l[0]] = l[1];
		} else {
			beatmap[l[0]] = parseFloat(l[1]);
		}
	}
	return beatmap;
}

function parseHitObject(data) {
	let splited = data.split(",");
	for (var i = 0; i < splited.length; i++) {
		if (/^[0-9]+$/.test(splited[i])) {
			splited[i] = parseFloat(splited[i]);
		}
	}
	return new HitObject(...splited);
}

function binary(number, length) {
	let asBinary = (number >>> 0). toString(2);
	while (asBinary.length <= 8) {
		asBinary = "0" + asBinary;
	}
	return asBinary; 
}

class HitObject {
	constructor(x, y, time, type, hitSound, objectParams, hitSample) {
		this.x = x;
		this.y = y;
		/* convert to seconds */
		this.time = time / 1000;
		this.type = reverse(binary(type));
		this.hitSound = hitSound;
		this.objectParams = objectParams;
		this.hitSample = hitSample;
	}
}

function reverse(str) {
	var splitString = str.split("");;
	var reverseArray = splitString.reverse();
	var joinArray = reverseArray.join("");
	return joinArray;
}

let beatmap = parseBeatMap(
`osu file format v14

[General]
AudioFilename: audio.mp3
AudioLeadIn: 0
PreviewTime: 59637
Countdown: 0
SampleSet: Soft
StackLeniency: 0.2
Mode: 0
LetterboxInBreaks: 0
WidescreenStoryboard: 0

[Editor]
DistanceSpacing: 1.2
BeatDivisor: 4
GridSize: 4
TimelineZoom: 2.5

[Metadata]
Title:Goodbye Moonmen- Rick and Morty Remix
TitleUnicode:Goodbye Moonmen- Rick and Morty Remix
Artist:The Living Tombstone
ArtistUnicode:The Living Tombstone
Creator:Kyrian
Version:Pog
Source:Rick and Morty
Tags:PP Pog Whitecat Rick Morty Jumps Practice Hard Fart Space Meme Moonman WashedUp Player Friendofox Chompy Uni-Desu Yukihana Lamy Nagabi Nagaraia Takakin cyb3rv1rus PaRaDogi Yoav Landau Custom Phase Fart Jemaine Clement ShadyVox Blake Swift Orko
BeatmapID:2499448
BeatmapSetID:1200218

[Difficulty]
HPDrainRate:3
CircleSize:4
OverallDifficulty:10
ApproachRate:10
SliderMultiplier:1.4
SliderTickRate:1

[Events]
//Background and Video events
0,0,"mJGRHh3.jpg",0,0
//Break Periods
//Storyboard Layer 0 (Background)
//Storyboard Layer 1 (Fail)
//Storyboard Layer 2 (Pass)
//Storyboard Layer 3 (Foreground)
//Storyboard Layer 4 (Overlay)
//Storyboard Sound Samples

[TimingPoints]
106,468.75,4,2,1,80,1,0
60106,-100,4,2,1,77,0,1
64559,-58.8235294117647,4,2,1,77,0,1
87059,-55.5555555555556,4,2,1,77,0,1
88231,-100,4,2,1,77,0,1
90106,-55.5555555555556,4,2,1,77,0,0


[HitObjects]
190,134,60106,5,6,3:2:0:0:
334,214,60223,1,0,0:0:0:0:
188,243,60340,5,0,0:0:0:0:
290,97,60457,1,0,0:0:0:0:
360,301,60574,5,8,0:0:0:0:
105,192,60691,1,0,0:0:0:0:
385,74,60809,5,0,0:0:0:0:
288,361,60926,1,0,0:0:0:0:
147,24,61043,5,0,3:2:0:0:
484,232,61160,1,0,0:0:0:0:
61,351,61277,5,0,0:0:0:0:
274,0,61395,1,0,0:0:0:0:
476,381,61512,5,8,0:0:0:0:
8,155,61629,1,0,0:0:0:0:
493,8,61746,5,0,0:0:0:0:
224,384,61863,1,0,0:0:0:0:
39,3,61981,5,0,3:2:0:0:
495,175,62098,1,0,0:0:0:0:
21,381,62215,5,0,0:0:0:0:
246,0,62332,1,0,0:0:0:0:
475,367,62449,5,8,0:0:0:0:
6,178,62566,1,0,0:0:0:0:
511,0,62684,5,0,0:0:0:0:
271,384,62801,1,0,0:0:0:0:
24,8,62918,5,0,3:2:0:0:
512,203,63035,1,0,0:0:0:0:
38,383,63152,5,0,0:0:0:0:
304,0,63270,1,0,0:0:0:0:
448,381,63387,5,8,0:0:0:0:
12,151,63504,1,0,0:0:0:0:
501,41,63621,5,0,0:0:0:0:
189,384,63738,1,0,0:0:0:0:
70,0,63856,5,2,3:2:0:0:
322,134,67606,5,6,3:2:0:0:
178,214,67723,1,0,0:0:0:0:
324,243,67840,5,0,0:0:0:0:
222,97,67957,1,0,0:0:0:0:
152,301,68074,5,8,0:0:0:0:
407,192,68191,1,0,0:0:0:0:
127,74,68309,5,0,0:0:0:0:
224,361,68426,1,0,0:0:0:0:
365,24,68543,5,0,3:2:0:0:
28,232,68660,1,0,0:0:0:0:
451,351,68777,5,0,0:0:0:0:
238,0,68895,1,0,0:0:0:0:
36,381,69012,5,8,0:0:0:0:
504,155,69129,1,0,0:0:0:0:
19,8,69246,5,0,0:0:0:0:
288,384,69363,1,0,0:0:0:0:
473,3,69481,5,0,3:2:0:0:
17,175,69598,1,0,0:0:0:0:
491,381,69715,5,0,0:0:0:0:
266,0,69832,1,0,0:0:0:0:
37,367,69949,5,8,0:0:0:0:
506,178,70066,1,0,0:0:0:0:
1,0,70184,5,0,0:0:0:0:
241,384,70301,1,0,0:0:0:0:
488,8,70418,5,0,3:2:0:0:
0,203,70535,1,0,0:0:0:0:
445,384,70652,5,0,0:0:0:0:
208,0,70770,1,0,0:0:0:0:
64,381,70887,5,8,0:0:0:0:
500,151,71004,1,0,0:0:0:0:
0,10,71121,5,0,0:0:0:0:
267,384,71238,1,0,0:0:0:0:
470,0,71356,5,2,3:2:0:0:
332,384,75106,5,6,3:2:0:0:
418,142,75223,1,0,0:0:0:0:
417,383,75340,5,0,0:0:0:0:
329,136,75457,1,0,0:0:0:0:
222,377,75574,5,8,0:0:0:0:
345,57,75691,1,0,0:0:0:0:
334,384,75809,5,0,0:0:0:0:
265,15,75926,1,0,0:0:0:0:
121,369,76043,5,0,3:2:0:0:
179,14,76160,1,0,0:0:0:0:
259,376,76277,5,0,0:0:0:0:
89,58,76395,1,0,0:0:0:0:
160,374,76512,5,8,0:0:0:0:
270,0,76629,1,0,0:0:0:0:
57,364,76746,5,0,0:0:0:0:
382,38,76863,1,0,0:0:0:0:
5,269,76981,5,0,3:2:0:0:
445,131,77098,1,0,0:0:0:0:
0,146,77215,5,0,0:0:0:0:
476,272,77332,1,0,0:0:0:0:
0,204,77449,5,8,0:0:0:0:
510,163,77566,1,0,0:0:0:0:
15,119,77684,5,0,0:0:0:0:
512,256,77801,1,0,0:0:0:0:
8,282,77918,5,0,3:2:0:0:
486,86,78035,1,0,0:0:0:0:
12,200,78152,5,0,0:0:0:0:
492,206,78270,1,0,0:0:0:0:
35,133,78387,5,8,0:0:0:0:
512,244,78504,1,0,0:0:0:0:
0,246,78621,5,0,0:0:0:0:
512,156,78738,1,0,0:0:0:0:
3,94,78856,5,2,3:2:0:0:
216,190,82606,5,6,3:2:0:0:
301,334,82723,1,0,0:0:0:0:
316,129,82840,5,0,0:0:0:0:
201,295,82957,1,0,0:0:0:0:
229,79,83074,5,8,0:0:0:0:
376,251,83191,1,0,0:0:0:0:
314,37,83309,5,0,0:0:0:0:
197,354,83426,1,0,0:0:0:0:
237,2,83543,5,0,3:2:0:0:
360,352,83660,1,0,0:0:0:0:
363,24,83777,5,0,0:0:0:0:
254,384,83895,1,0,0:0:0:0:
207,50,84012,5,8,0:0:0:0:
446,355,84129,1,0,0:0:0:0:
465,5,84246,5,0,0:0:0:0:
315,372,84363,1,0,0:0:0:0:
360,0,84481,5,0,3:2:0:0:
396,373,84598,1,0,0:0:0:0:
269,2,84715,5,0,0:0:0:0:
305,383,84832,1,0,0:0:0:0:
174,0,84949,5,8,0:0:0:0:
209,383,85066,1,0,0:0:0:0:
82,0,85184,5,0,0:0:0:0:
118,383,85301,1,0,0:0:0:0:
0,2,85418,5,0,3:2:0:0:
36,384,85535,1,0,0:0:0:0:
98,2,85652,5,0,0:0:0:0:
134,384,85770,1,0,0:0:0:0:
198,1,85887,5,8,0:0:0:0:
233,384,86004,1,0,0:0:0:0:
292,1,86121,5,0,0:0:0:0:
327,384,86238,1,0,0:0:0:0:
400,0,86356,5,2,3:2:0:0:
104,242,88231,6,0,P|145:261|189:255,1,70,2|2,0:0|0:0,0:0:0:0:
209,116,88699,2,0,P|179:133|159:162,1,70,10|2,0:0|0:0,0:0:0:0:
266,269,89168,2,0,P|265:234|250:202,1,70,2|2,0:0|0:0,0:0:0:0:
209,348,89637,1,10,0:0:0:0:
305,357,89871,1,10,0:0:0:0:
361,279,90106,5,6,3:2:0:0:
`);