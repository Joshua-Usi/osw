class Mouse {
	constructor(element, max) {
		if (max === undefined) {
			max = 0;
		}
		/* Element id */
		this.element = element;
		this.position = {
			x: 0,
			y: 0,
		};
		this.previousPositions = {
			x: [],
			y: [],
		};
		this.previousPositionsMax = max;
		this.isLeftButtonDown = false;
		this.isRightButtonDown = false;
		this.events = [];
		this.canUserControl = true;
		/* needed to access outside scope */
		let that = this;
		/* References to functions for destroying */
		this.removeOldEvents = function(context) {
			for (var i = 0; i < context.events.length; i++) {
				if (context.events[i] < Date.now() - 1000) {
					context.events.splice(i, 1);
				}
			}
		}
		this.mousemove = function(event) {
			that.removeOldEvents(that);
			if (that.canUserControl) {
				that.events.push(Date.now());
				that.previousPositions.x.push(that.position.x);
				that.previousPositions.y.push(that.position.y);
				if (that.previousPositions.x.length >= that.previousPositionsMax) {
					that.previousPositions.x.splice(0, 1);
				}
				if (that.previousPositions.y.length >= that.previousPositionsMax) {
					that.previousPositions.y.splice(0, 1);
				}
				that.position.x = event.x;
				that.position.y = event.y;
			}
		};
		this.contextmenu = event => event.preventDefault();
		this.mousedown = function(event) {
			if (that.canUserControl) {
				that.isLeftButtonDown = true;
			}
		};
		this.mouseup = function(event) {
			if (that.canUserControl) {
				that.isLeftButtonDown = false;
			}
		};
	}
	init() {
		/* needed to access outside scope */
		let that = this;
		document.getElementById(this.element).addEventListener("mousemove", this.mousemove);
		document.getElementById(this.element).addEventListener('contextmenu', this.contextmenu);
		document.getElementById(this.element).addEventListener("mousedown", this.mousedown);
		document.getElementById(this.element).addEventListener("mouseup", this.mouseup);
	}
	destroy() {
		/* needed to access outside scope */
		let that = this;
		document.getElementById(this.element).removeEventListener("mousemove", this.mousemove);
		document.getElementById(this.element).removeEventListener('contextmenu', this.contextmenu);
		document.getElementById(this.element).removeEventListener("mousedown", this.mousedown);
		document.getElementById(this.element).removeEventListener("mouseup", this.mouseup);
	}
	setPosition(x, y) {
		this.removeOldEvents(this);
		this.events.push(Date.now());
		this.previousPositions.x.push(this.position.x);
		this.previousPositions.y.push(this.position.y);
		if (this.previousPositions.x.length >= this.previousPositionsMax) {
			this.previousPositions.x.splice(0, 1);
		}
		if (this.previousPositions.y.length >= this.previousPositionsMax) {
			this.previousPositions.y.splice(0, 1);
		}
		this.position.x = x;
		this.position.y = y;
	}
	changePosition(x, y) {
		this.removeOldEvents(this);
		this.events.push(Date.now());
		this.previousPositions.x.push(this.position.x);
		this.previousPositions.y.push(this.position.y);
		if (this.previousPositions.x.length >= this.previousPositionsMax) {
			this.previousPositions.x.splice(0, 1);
		}
		if (this.previousPositions.y.length >= this.previousPositionsMax) {
			this.previousPositions.y.splice(0, 1);
		}
		this.position.x += x;
		this.position.y += y;
	}
	disableUserControl() {
		this.canUserControl = false;
	}
	enableUserControl() {
		this.canUserControl = true;
	}
}