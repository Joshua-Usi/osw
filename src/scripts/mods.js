define(function(require) {
	return function(easy, noFail, halfTime, hardRock, suddenDeath, perfect, doubleTime, nightcore, hidden, flashlight, relax, autopilot, spunOut, auto, scoreV2) {
		return {
			/* difficulty reduction*/
			easy: easy || false,
			noFail: noFail || false,
			halfTime: halfTime || false,
			/* difficulty increases*/
			hardRock: hardRock || false,
			suddenDeath: suddenDeath || false,
			perfect: perfect || false,
			doubleTime: doubleTime || false,
			nightcore: nightcore || false,
			hidden: hidden || false,
			flashlight: flashlight || false,
			/* special */
			relax: relax || false,
			autopilot: autopilot || false,
			spunOut: spunOut || false,
			auto: auto || false,
			scoreV2: scoreV2 || false,
		};
	};
});