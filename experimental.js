(function() {
	let mouse = {
		x: 0,
		y: 0,
	};
	let canvas = document.createElement("canvas");
	canvas.id = "gameplay";
	canvas.height = 0.8 * window.innerHeight;
	canvas.width = 1.5 * 0.8 * window.innerHeight;
	canvas.style.border = "1px solid #000";
	canvas.style.margin = "0";
	canvas.style.position = "absolute";
	canvas.style.top = "50%";
	canvas.style.left = "50%";
	canvas.style.transform = "translate(-50%, -50%)";
	document.querySelector("body").appendChild(canvas);
	let ctx = canvas.getContext("2d");
	canvas.addEventListener('mousemove', function(event) {
		mouse.x = event.x;
		mouse.y = event.y;
	});
	window.addEventListener("load", function() {
		(function animate() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.fillRect(mouse.x, mouse.y, 30, 30);
			requestAnimationFrame(animate);
		})();
	})
})();