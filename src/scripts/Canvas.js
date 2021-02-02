define(function(require) {
	return class Canvas {
		constructor(canvasId, append) {
			this.canvas = document.createElement("canvas");
			this.canvas.id = canvasId;
			this.canvas.style.margin = 0;
			document.getElementById(append).append(this.canvas);
			this.context = this.canvas.getContext("2d");
			this.customProperties = {
				/* 
				 *
				 */
				textAlign: "left",
				imageAling: "center",
			}
		}
		setWidth(width) {
			this.canvas.width = width;
		}
		setHeight(height) {
			this.canvas.height = height;
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