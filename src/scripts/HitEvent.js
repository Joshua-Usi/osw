define(function(require) {
	return class HitEvent {
		constructor(type, score, combo, x, y) {
			this.type = type;
			this.score = score;
			this.combo = combo;
			this.x = x;
			this.y = y;
		}
	}
});