export class AnimatedEventsManager {
	constructor() {
		this.events = [];
		this.eventsEveryFrame = [];
		this.currentEvent = 0;
		this.isDone = false;
	}
	static UntimedEvent = class UntimedEvent {
		constructor(callback) {
			this.callback = callback;
		}
	};
	static TimedEvent = class TimedEvent extends this.UntimedEvent {
		constructor(time, callback) {
			super(callback);
			this.time = time;
		}
	};
	addEvent(event) {
		this.events.push(event);
	}
	addEventEveryFrame(event) {
		this.eventsEveryFrame.push(event);
	}
	runEvent(eventIndex) {
		if (this.events[eventIndex]) {
			this.events[eventIndex].callback();
			return;
		}
		throw new Error("eventIndex out of range");
	}
	update(time) {
		while (this.events[this.currentEvent] && time >= this.events[this.currentEvent].time) {
			this.runEvent(this.currentEvent);
			this.currentEvent++;
		}
		for (let i = 0; i < this.eventsEveryFrame.length; i++) {
			this.eventsEveryFrame[i].callback(time);
		}
		if (this.currentEvent > this.events.length) {
			this.isDone = true;
		}
	}
}