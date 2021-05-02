define(function(require) {
	return class AudioManager {
		constructor() {
			// map for loaded sounds
			this.sounds = {};
			// create our permanent nodes
			this.nodes = {
				destination: this.audioContext.destination,
				masterGain: this.audioContext.createGain(),
				musicGain: this.audioContext.createGain(),
				effectsGain: this.audioContext.createGain()
			};
			// and setup the graph
			this.nodes.masterGain.connect(this.nodes.destination);
			this.nodes.musicGain.connect(this.nodes.masterGain);
			this.nodes.effectsGain.connect(this.nodes.masterGain);
		}
		set
	}
});

html5rocks.com/en/tutorials/webaudio/fieldrunners/