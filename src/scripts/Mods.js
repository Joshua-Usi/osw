define(function(require) {
	return function(easy, noFail, halfTime, hardRock, suddenDeath, perfect, doubleTime, nightCore, hidden, flashLight, relax, autoPilot, spunOut, auto, cinema, scoreV2) {
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
			nightCore: nightCore || false,
			hidden: hidden || false,
			flashLight: flashLight || false,
			/* special */
			relax: relax || false,
			autoPilot: autoPilot || false,
			spunOut: spunOut || false,
			auto: auto || false,
			cinema: cinema || false,
			scoreV2: scoreV2 || false,
		};
	};
});