define(function(require) {
  "use strict";
	return class Keyboard {
		constructor(element) {
			this.element = element;
			this.keys = [];
			this.releasedKeys = [];
			this.keyData = [];
			/*
			 *	IIFE to set keydata
			 */
			(() => {
				this.keyData[8] = "backspace";
				this.keyData[9] = "tab";
				this.keyData[13] = "enter";
				this.keyData[16] = "shift";
				this.keyData[17] = "ctrl";
				this.keyData[18] = "alt";
				this.keyData[27] = "esc";
				this.keyData[32] = "space";
				this.keyData[37] = "arrowLeft";
				this.keyData[38] = "arrowUp";
				this.keyData[39] = "arrowRight";
				this.keyData[40] = "arrowDown";
				this.keyData[46] = "delete";
				const alphabet = "abcdefghijklmnopqrstuvwxyz";
				/* keys 0-9 */
				for (let i = 48; i < 58; i++) {
					this.keyData[i] = i - 48;
				}
				/* keys a-z */
				for (let i = 65; i < 91; i++) {
					this.keyData[i] = alphabet.substr(i - 65, 1);
				}
				/* numpad keys 0-9 */
				for (let i = 96; i < 106; i++) {
					this.keyData[i] = "numpad" + (i - 96);
				}
				/* 		fn keys */
				for (let i = 113; i < 125; i++) {
					this.keyData[i] = "f" + (i - 112);
				}
				this.keyData[186] = "semi-colon";
				this.keyData[187] = "equal sign";
				this.keyData[188] = "comma";
				this.keyData[189] = "dash";
				this.keyData[190] = "period";
				this.keyData[191] = "forward slash";
				this.keyData[219] = "open bracket";
				this.keyData[220] = "back slash";
				this.keyData[221] = "close bracket";
				this.keyData[222] = "single quote";
			})();
			const that = this;
			this.keydown = function(e) {
				if (that.keys[e.keyCode] === true) {
					that.releasedKeys[e.keyCode] = false;
				}
				that.keys[e.keyCode] = true;
			};
			this.keyup = function(e) {
				that.releasedKeys[e.keyCode] = true;
				that.keys[e.keyCode] = false;
			};
		}
		getKeyDown(keyName) {
			let key = -1;
			for (var i = 0; i < this.keyData.length; i++) {
				if (this.keyData[i] === keyName) {
					key = i;
					break;
				}
			}
			return this.keys[key];
		}
		emulateKeyDown(keyName) {
			let key = -1;
			for (var i = 0; i < this.keyData.length; i++) {
				if (this.keyData[i] === keyName) {
					key = i;
					break;
				}
			}
			this.keys[key] = true;
		}
		emulateKeyUp(keyName) {
			let key = -1;
			for (var i = 0; i < this.keyData.length; i++) {
				if (this.keyData[i] === keyName) {
					key = i;
					break;
				}
			}
			this.keys[key] = false;
		}
		init() {
			document.getElementById(this.element).addEventListener("keydown", this.keydown);
			document.getElementById(this.element).addEventListener("keyup", this.keyup);
		}
		destroy() {
			document.getElementById(this.element).removeEventListener("keydown", this.keydown);
			document.getElementById(this.element).removeEventListener("keyup", this.keyup);
		}
	};
});