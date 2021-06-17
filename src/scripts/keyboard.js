define(function(require) {
	"use strict";
	return class Keyboard {
		constructor(element) {
			this.element = element;
			this.keys = [];
			this.releasedKeys = [];
			this.keyMap = {};
			/*
			 *	IIFE to set keyMap
			 */
			(() => {
				let keyData = [];
				keyData[8] = "backspace";
				keyData[9] = "tab";
				keyData[13] = "enter";
				keyData[16] = "shift";
				keyData[17] = "control";
				keyData[18] = "alt";
				keyData[27] = "escape";
				keyData[32] = "space";
				keyData[37] = "arrowLeft";
				keyData[38] = "arrowUp";
				keyData[39] = "arrowRight";
				keyData[40] = "arrowDown";
				keyData[46] = "delete";
				const alphabet = "abcdefghijklmnopqrstuvwxyz";
				/* keys 0-9 */
				for (let i = 48; i < 58; i++) {
					keyData[i] = i - 48;
				}
				/* keys a-z */
				for (let i = 65; i < 91; i++) {
					keyData[i] = alphabet.substr(i - 65, 1);
				}
				/* numpad keys 0-9 */
				for (let i = 96; i < 106; i++) {
					keyData[i] = "numpad" + (i - 96);
				}
				/* fn keys */
				for (let i = 113; i < 125; i++) {
					keyData[i] = "f" + (i - 112);
				}
				keyData[186] = ";";
				keyData[187] = "=";
				keyData[188] = ",";
				keyData[189] = "-";
				keyData[190] = ".";
				keyData[191] = "/";
				keyData[219] = "[";
				keyData[220] = "\\";
				keyData[221] = "]";
				keyData[222] = "\'";
				for (let i = 0; i < keyData.length; i++) {
					if (keyData[i]) {
						this.keyMap[keyData[i]] = i;
					}
				}
				console.log(this.keyMap);
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
			return this.keys[this.keyMap[keyName]];
		}
		emulateKeyDown(keyName) {
			this.keys[this.keyMap[keyName]] = true;
		}
		emulateKeyUp(keyName) {
			this.keys[this.keyMap[keyName]] = false;
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