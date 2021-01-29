define(function(require) {
	return `osu file format v14

[General]
AudioFilename: tutorial.ogg
AudioLeadIn: 0
PreviewTime: -1
Countdown: 0
SampleSet: Normal
StackLeniency: 0.7
Mode: 0
LetterboxInBreaks: 0
UseSkinSprites: 1
WidescreenStoryboard: 0

[Editor]
Bookmarks: 42132
DistanceSpacing: 0.5
BeatDivisor: 4
GridSize: 4
TimelineZoom: 1

[Metadata]
Title:osu! tutorial
TitleUnicode:
Artist:Peter Lambert
ArtistUnicode:
Creator:peppy
Version:Gameplay basics
Source:
Tags:
BeatmapID:22538
BeatmapSetID:3756

[Difficulty]
HPDrainRate:0
CircleSize:3
OverallDifficulty:0
ApproachRate:0
SliderMultiplier:0.6
SliderTickRate:1

[Events]
//Background and Video events
//Break Periods
2,34862,82246
2,93224,112176
//Storyboard Layer 0 (Background)
Sprite,Background,Centre,"bg.jpg",320,264
 L,4722,16
  S,0,0,3740,1.5,1.9
  S,0,3740,7480,1.9,1.5
 F,1,4722,5470,0,1
 F,0,121068,121816,1,0
Sprite,Background,Centre,"osulogo.png",320,250
 F,0,24,607,0,1
 M,1,24,1729,0,250,320,250
 R,1,24,1729,-4,0
 S,1,1729,2103,1.1,1
 S,1,2103,2477,1.1,1
 S,1,2477,2851,1.1,1
 S,1,2851,3225,1.1,1
 S,1,3225,3599,1.1,1
 S,1,3599,3974,1.1,1
 S,1,3974,4348,1.1,1
 S,1,4348,4722,1.1,1
 F,1,4722,5470,1,0
 S,1,4722,5470,1.1,5
Sprite,Background,Centre,"howto.png",320,180
 M,0,1024,1624,320,-40,300,180
 F,0,1024,1624,0,1
 R,0,1024,1624,0.5,-0.1
 S,1,1729,2103,1.1,1
 S,1,2103,2477,1.1,1
 S,1,2477,2851,1.1,1
 S,1,2851,3225,1.1,1
 F,0,3225,3599,1,0
 S,0,3225,3599,1,3
Sprite,Background,Centre,"text1.png",320,130
 F,0,5024,6024,0,1
 F,0,9024,10024,1,0
Sprite,Background,Centre,"hitcircle1.png",320,320
 S,0,21944,,0.6
 F,0,21944,22624,1,0
Sprite,Background,Centre,"hitcircle1.png",320,320
 S,0,6024,,0.6
 F,0,6024,6424,0,1
 F,0,21944,22324,1,0
 S,0,21944,22324,0.6,1.2
Sprite,Background,Centre,"hitcircle2.png",200,320
 F,0,24175,25175,1,0
 S,1,24175,25175,0.6,1.2
Sprite,Background,Centre,"hitcircle2.png",280,320
 F,0,24923,26023,1,0
 S,1,24923,26023,0.6,1.2
Sprite,Background,Centre,"hitcircle2.png",360,320
 F,0,25672,27290,1,0
 S,1,25672,27290,0.6,1.2
Sprite,Background,Centre,"hitcircle2.png",440,320
 F,0,26420,28020,1,0
 S,1,26420,28020,0.6,1.2
Sprite,Background,Centre,"approachcircle1.png",320,320
 S,0,9524,,1.8
 F,0,9524,10024,0,1
 S,0,14854,21944,1.8,0.6
 F,0,21944,22024,1,0
Sprite,Background,TopLeft,"mouse.png",320,320
 R,0,19264,,0
 M,1,19264,21944,700,370,320,320
 R,2,21944,22944,-0.2,0
Sprite,Background,Centre,"text2.png",320,130
 F,0,9524,10524,0,1
 F,0,13524,14524,1,0
Sprite,Background,Centre,"text3.png",320,130
 F,0,14024,15024,0,1
 F,0,18024,19024,1,0
Sprite,Background,Centre,"text4.png",320,130
 F,0,18524,19524,0,1
 F,0,22024,23024,1,0
Sprite,Background,Centre,"text5.png",320,130
 F,0,23024,23524,0,1
 F,0,27024,27524,1,0
Sprite,Background,Centre,"text6.png",320,130
 F,0,27024,27524,0,1
 F,0,31024,31524,1,0
Sprite,Background,Centre,"hand2.png",0,0
 F,0,28351,29071,0,1
 R,0,28351,29771,0,0.4
 M,1,28351,29901,-30,300,135,200
 M,1,29901,30261,135,200,135,300
 M,1,30261,31383,135,300,265,200
 M,1,31383,31757,265,200,265,300
 M,1,31757,32879,265,300,400,200
 M,1,32879,33254,400,200,400,300
 M,1,33254,34376,400,300,530,200
 M,1,34376,34750,530,200,530,300
 F,0,35150,35640,1,0
Sprite,Background,Centre,"text7.png",320,120
 F,0,42132,42632,0,1
 F,0,51132,51632,1,0
Sprite,Background,Centre,"slider.png",320,210
 F,0,43132,43632,0,1
 M,0,52132,53132,320,210,320,270
 F,0,78046,78546,1,0
Sprite,Background,Centre,"text8a.png",320,325
 F,0,44132,44632,0,1
 F,0,51132,51632,1,0
Sprite,Background,Centre,"text8b.png",320,325
 F,0,45251,46251,0,1
 F,0,51132,51632,1,0
Sprite,Background,Centre,"sliderb0.png",206,210
 F,0,44132,44632,0,1
 S,0,45132,,0.6
 F,0,51132,51632,1,0
Sprite,Background,Centre,"sliderfollowcircle.png",206,210
 S,0,45251,45252,0.6
 F,0,45251,46451,0,1
 F,0,51132,51632,1,0
Sprite,Background,Centre,"text9.png",320,400
 F,0,46632,47632,0,1
 F,0,51132,51632,1,0
Sprite,Background,Centre,"sliderscorepoint.png",320,208
 F,0,46632,47632,0,1
 M,0,52132,53132,320,208,320,268
 F,0,62708,,1,0
Sprite,Background,Centre,"text10.png",320,130
 F,0,53132,53632,0,1
 F,0,65132,65632,1,0
Sprite,Background,Centre,"approachcircle2.png",207,270
 S,0,54132,,1.8
 F,0,54132,54632,0,1
 S,0,55132,60089,1.8,0.6
 F,0,60589,61089,1,0
Sprite,Background,Centre,"text11.png",320,420
 F,0,60089,60589,0,1
 F,0,65089,65589,1,0
Animation,Background,Centre,"sliderb.png",207,270,1,200,LoopForever
 S,0,60089,,0.6
 M,0,60089,65701,207,270,437,270
 S,0,65701,65901,0.6,1.2
 F,0,65701,65950,1,0
Sprite,Background,Centre,"sliderfollowcircle.png",207,270
 S,0,60089,60289,0.3,0.6
 M,0,60089,65701,207,270,437,270
 S,0,63082,63269,0.7,0.6
 S,0,65701,65901,0.6,1.2
 F,0,65701,65950,1,0
Sprite,Background,Centre,"hitcircle2.png",208,270
 F,0,60089,60589,1,0
 S,0,60089,60589,0.6,1.2
Sprite,Background,Centre,"text12.png",320,120
 F,0,66571,67071,0,1
 F,0,69571,70071,1,0
Sprite,Background,Centre,"reversearrow.png",435,270
 L,67945,19
  S,0,0,370,0.7,0.6
  R,0,0,370,3.5,3
 S,0,68071,,0.6
 R,0,68071,,3
 F,0,68071,68571,0,1
 F,0,75053,,0
Sprite,Background,Centre,"text13.png",320,120
 F,0,69571,70071,0,1
 F,0,77571,78071,1,0
Sprite,Background,Centre,"sliderscorepoint.png",320,265
 F,0,70071,70571,0,1
 F,0,73370,73500,1,0
 F,0,75053,75303,0,1
 F,0,76363,,1,0
Sprite,Background,Centre,"approachcircle2.png",207,270
 S,0,70071,,1.8
 F,0,70071,70571,0,1
 S,0,70071,72060,1.8,0.6
 F,0,72060,72560,1,0
 S,0,72060,72560,0.6
Animation,Background,Centre,"sliderb.png",207,270,1,200,LoopForever
 S,0,72060,,0.6
 M,0,72060,75053,207,270,437,270
 M,0,75053,78046,437,270,207,270
 F,0,78046,78546,1,0
 S,0,78046,78546,0.6,1.2
Sprite,Background,Centre,"sliderfollowcircle.png",207,270
 S,0,72060,72260,0.3,0.6
 M,0,72060,75053,207,270,437,270
 S,0,73557,73744,0.7,0.6
 S,0,75053,75240,0.7,0.6
 M,0,75053,78046,437,270,207,270
 S,0,76550,76737,0.7,0.6
 F,0,78046,78546,1,0
 S,0,78046,78546,0.6,1.2
Sprite,Background,Centre,"hitcircle2.png",208,270
 F,0,72060,72360,1,0
 S,0,72060,72360,0.6,1.2
 F,0,78046,78346,1,0
 S,0,78046,78546,0.6,1.2
Sprite,Background,Centre,"text14.png",320,400
 F,0,75053,75553,0,1
 F,0,77571,78071,1,0
Sprite,Background,Centre,"hitcircle2.png",435,270
 F,0,75053,75353,1,0
 S,0,75053,75353,0.6,1.2
Sprite,Background,Centre,"text15.png",320,150
 F,0,79917,80417,0,1
 F,0,82917,83417,1,0
Sprite,Background,Centre,"hand2.png",0,0
 R,0,81535,,0.4
 F,0,81535,82253,0,1
 M,1,81535,83658,-30,300,145,120
 M,2,83658,84032,145,120,145,210
 M,0,84032,86276,145,210,505,210
 M,1,86276,86650,510,210,510,170
 M,2,86650,87024,510,170,510,285
 M,0,87024,89269,510,285,150,285
 M,0,89269,89643,150,285,195,245
 M,2,89643,90017,195,245,210,370
 M,0,90017,91514,210,370,435,370
 M,0,91514,93010,435,370,210,370
 F,0,93510,94010,1,0
Sprite,Background,Centre,"spinner-background.png",320,250
 S,0,100492,,0.66
 F,0,100492,100992,0,1
 F,0,107600,108100,1,0
Sprite,Background,Centre,"spinner-circle.png",320,250
 S,0,100492,,0.66
 F,0,100492,100992,0,1
 R,0,103485,107600,0,32
 F,0,107600,108100,1,0
Sprite,Background,Centre,"approachcircle2.png",320,250
 F,0,102985,103485,0,1
 S,0,103485,,3.8
 S,0,103485,107600,3.8,0.1
 F,0,107600,108100,1,0
 S,0,107600,108100,0.1
Sprite,Background,Centre,"text16.png",320,100
 F,0,98996,99496,0,1
 F,0,101996,102496,1,0
Sprite,Background,Centre,"text17.png",320,100
 F,0,101996,102496,0,1
 F,0,106996,107496,1,0
Sprite,Background,Centre,"text18.png",320,390
 F,0,103485,103985,0,1
 F,0,106996,107496,1,0
Sprite,Background,Centre,"text19.png",320,150
 F,0,108722,109222,0,1
 F,0,111722,112222,1,0
//Storyboard Layer 1 (Fail)
Sprite,Fail,Centre,"result-bad.png",320,240
 F,0,36364,37024,0,1
 S,1,36364,37024,0.2,1
 F,0,40024,40524,1,0
Sprite,Fail,Centre,"result-bad.png",320,240
 F,0,94507,95267,0,1
 S,1,94507,95267,0.2,1
 F,0,97567,98067,1,0
Sprite,Fail,Centre,"spinbad.png",320,240
 F,0,121091,121791,0,1
 S,1,121091,121791,0.2,1
 F,0,124091,124791,1,0
//Storyboard Layer 2 (Pass)
Sprite,Pass,Centre,"result-good.png",320,240
 F,0,36364,37024,0,1
 S,1,36364,37024,2.2,1
 F,0,40024,40524,1,0
Sprite,Pass,Centre,"result-good.png",320,240
 F,0,94507,95267,0,1
 S,1,94507,95267,2.2,1
 F,0,97567,98067,1,0
Sprite,Pass,Centre,"spingood.png",320,240
 F,0,121091,121791,0,1
 S,1,121091,121791,2.2,1
 F,0,124091,124791,1,0
//Storyboard Layer 3 (Foreground)
Sprite,Foreground,TopLeft,"mouse.png",0,0
 S,0,57089,,0.75
 R,2,57089,,0
 M,1,57089,60089,700,370,207,270
 R,1,60089,60339,0,-0.2
 M,0,60089,65701,207,270,437,270
 F,1,65701,66201,1,0
 R,2,65701,66201,-0.2,0
Sprite,Foreground,TopLeft,"mouse.png",0,0
 S,0,70190,,0.75
 R,2,70190,,0
 M,1,70190,72060,700,370,207,270
 R,1,72060,72247,0,-0.2
 M,0,72060,75053,207,270,437,270
 M,0,75053,78046,437,270,207,270
 F,1,78046,78546,1,0
 R,1,78046,78546,-0.2,0
//Storyboard Layer 4 (Overlay)
//Storyboard Sound Samples
Sample,5844,0,"dake/Part 1 - Hit Circle.mp3",100
Sample,10333,0,"dake/Part 2 - Approach Circle.mp3",100
Sample,15197,0,"dake/Part 3 - Approach Circle 2.mp3",100
Sample,19312,0,"dake/Part 4 - Click.mp3",100
Sample,21930,0,"normal-hitwhistle.mp3",100
Sample,21930,0,"normal-hitnormal.mp3",100
Sample,22666,0,"dake/Part 5 - Rhythm.mp3",100
Sample,28416,0,"dake/Part 6 - Your Turn.mp3",100
Sample,36769,1,"dake/Bad Result.mp3",100
Sample,36769,2,"dake/Good Result.mp3",100
Sample,42006,0,"dake/Part 7 - Slider.mp3",100
Sample,53355,0,"dake/Part 8 - Click and Hold.mp3",100
Sample,60089,0,"dake/Part 9 - Follow.mp3",100
Sample,60089,0,"normal-hitnormal.mp3",100
Sample,63082,0,"normal-slidertick.mp3",100
Sample,65701,0,"normal-hitnormal.mp3",100
Sample,66323,0,"dake/Part 10 - Reverse Arrow.mp3",100
Sample,70190,0,"dake/Part 11 - Reverse Arrow 2.mp3",100
Sample,72060,0,"normal-hitnormal.mp3",100
Sample,73557,0,"normal-slidertick.mp3",100
Sample,75053,0,"normal-hitnormal.mp3",100
Sample,75427,0,"dake/Part 12 - Reverse Arrow 3.mp3",100
Sample,76550,0,"normal-slidertick.mp3",100
Sample,78046,0,"normal-hitnormal.mp3",100
Sample,80291,0,"dake/Part 13 - Hit The Sliders.mp3",100
Sample,95500,1,"dake/Bad Result2.mp3",100
Sample,95500,2,"dake/Good Result.mp3",100
Sample,99370,0,"dake/Part 14 - Spinner.mp3",100
Sample,102163,0,"dake/Part 15 - Spinner 2.mp3",100
Sample,104046,0,"dake/Part 16 - Drag in Circles.mp3",100
Sample,107600,0,"normal-hitwhistle.mp3",100
Sample,107600,0,"normal-hitnormal.mp3",100
Sample,109097,0,"dake/Part 17 - Next one.mp3",100
Sample,121629,2,"dake/awpgood.mp3",100
Sample,121629,1,"dake/awpbad.mp3",100

[TimingPoints]
243,374.123299999999,4,1,0,100,1,0


[HitObjects]
64,280,30172,5,0,0:0:0:0:
192,280,31669,1,0,0:0:0:0:
328,280,33165,1,0,0:0:0:0:
456,280,34662,1,0,0:0:0:0:
72,192,84046,6,0,B|464:192,1,360
440,272,87039,2,0,B|48:272,1,360
136,352,90032,2,0,B|392:352,2,240
256,192,113976,12,0,119587,0:0:0:0:
`;
});