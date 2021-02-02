define(function(require) {
	return class Canvas {
		constructor(canvasId, append) {
			let canvas = document.createElement("canvas");
			canvas.id = canvasId;
			document.getElementById(append).append(canvas);
			this.context = canvas.getContext("2d");
			this.customProperties = {
				textAlign: "left";
			}
		}
		setStrokeStyle(style) {
			this.context.strokeStyle = style;
		}
		getStrokeStyle(style) {
			return this.context.strokeStyle;
		}
		setFillStyle(style) {
			this.context.fillStyle = style;	
		}
		getFillStyle(style) {
			return this.context.fillStyle;
		}
		setlineCap(style) {
			this.context.lineCap = style;
		}
		getlineCap(style) {
			return this.context.lineCap;	
		}
		setlineJoin(style) {
			this.context.lineJoin = style;
		}
		getlineJoin(style) {
			return this.context.lineJoin;	
		}
		setStrokeWidth(style) {
			this.context.lineWidth = style;
		}
		getStrokeWidth(style) {
			return this.context.lineWidth;	
		}
		setGlobalAlpha(alpha) {

		}
		getGlobalAlpha()
	}
});