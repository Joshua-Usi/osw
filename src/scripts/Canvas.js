define(function(require) {
	return class Canvas {
		constructor(canvasId, append) {
			let canvas = document.createElement("canvas");
			canvas.id = canvasId;
			document.getElementById(append).append(canvas);
			this.context = canvas.getContext("2d");
			this.customProperties = {
				/* 
				 *
				 */
				textAlign: "left",
				imageAling: "center";
			}
		}
		setStrokeStyle(style) {
			this.context.strokeStyle = style;
		}
		getStrokeStyle() {
			return this.context.strokeStyle;
		}
		setFillStyle(style) {
			this.context.fillStyle = style;	
		}
		getFillStyle() {
			return this.context.fillStyle;
		}
		setlineCap(style) {
			this.context.lineCap = style;
		}
		getlineCap() {
			return this.context.lineCap;	
		}
		setlineJoin(style) {
			this.context.lineJoin = style;
		}
		getlineJoin() {
			return this.context.lineJoin;	
		}
		setStrokeWidth(style) {
			this.context.lineWidth = style;
		}
		getStrokeWidth() {
			return this.context.lineWidth;	
		}
		setGlobalAlpha(alpha) {
			this.context.globalAlpha = alpha;
		}
		getGlobalAlpha() {
			return this.context.globalAlpha;
		}
	}
});