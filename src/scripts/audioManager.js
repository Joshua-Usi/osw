define(function(require) {
	return class AudioManager {
		constructor() {
			// map for loaded sounds
			this.sounds = {};
			this.musicVolume = 1;
			this.effectsVolume = 1;
		}
		/* value between 0 and 1, where 0 = muted */
		setMusicVolume(volume) {
			this.musicVolume = volume;
		}
		/* value between 0 and 1, where 0 = muted */
		setEffectsVolume(volume) {
			this.effectsVolume = volume;
		}
		/* type is a string data that is either "music" or "effects" */
		load(id, src, type, allowMultiPlay) {
			this.sounds[id] = {
				audio: new Audio(src),
				allowMultiPlay: allowMultiPlay,
				type: type,
			};
		}
		changeSource(id, src) {
			this.sounds[id].audio.src = src;
		}
		play(id, volumeOverride) {
			if (this.sounds[id].allowMultiPlay) {
				let cloned = this.sounds[id].audio.cloneNode();
					if (volumeOverride) {
					cloned.volume = volumeOverride;
				} else {
					if (this.sounds[id].type === "music") {
						cloned.volume = this.musicVolume;
					} else {
						cloned.volume = this.effectsVolume;
					}
				}
				cloned.play();
			} else {
				if (volumeOverride) {
					this.sounds[id].audio.volume = volumeOverride;
				} else {
					if (this.sounds[id].type === "music") {
						this.sounds[id].audio.volume = this.musicVolume;
					} else {
						this.sounds[id].audio.volume = this.effectsVolume;
					}
				}
				this.sounds[id].audio.play();
			}
		}
		pause(id) {
			if (this.sounds[id].audio.paused === false) {
				this.sounds[id].audio.pause();
			}
		}
	}
});