define(function(require) {
  "use strict";
	const Parser = require("src/scripts/Parser.js");
	return Parser.parseBeatMap(`osu file format v14

[General]
AudioFilename: audio.mp3
AudioLeadIn: 0
PreviewTime: -1
Countdown: 1
SampleSet: Normal
StackLeniency: 0.7
Mode: 0
LetterboxInBreaks: 0
WidescreenStoryboard: 0

[Editor]
DistanceSpacing: 1.5
BeatDivisor: 16
GridSize: 32
TimelineZoom: 1

[Metadata]
Title:
TitleUnicode:
Artist:Spinner test map
ArtistUnicode:Spinner test map
Creator:experimentator
Version:none
Source:
Tags:
BeatmapID:0
BeatmapSetID:-1

[Difficulty]
HPDrainRate:0
CircleSize:2
OverallDifficulty:0
ApproachRate:0
SliderMultiplier:1.4
SliderTickRate:1

[Events]
//Background and Video events
//Break Periods
//Storyboard Layer 0 (Background)
//Storyboard Layer 1 (Fail)
//Storyboard Layer 2 (Pass)
//Storyboard Layer 3 (Foreground)
//Storyboard Sound Samples

[TimingPoints]
0,500,4,1,0,100,1,0


[HitObjects]
256,192,0,12,0,68260,0:0:0:0:
`);
});