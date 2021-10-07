let canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let ctx = canvas.getContext("2d");


let slider = {
	totalSlides: 8,
	percent: 0,
	slides: 0,
	headHit: true,
}

// // first 0
// head 0
// tail 0
// // head hit 0
// head 1
// tail 0
// // tail hit 1
// head 1
// tail 1
// // head hit 2
// head 2
// tail 1
// // tail hit 3
// head 2
// tail 2
// // head hit 4
// head 3
// tail 2

// 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
// 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6,  6
// 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5,  6

function elementIndex(x, type) {
	if (type === "head") {
		return Math.floor(x / 2) + 1
	} else if (type === "tail") {
		return Math.floor((x - 1) / 2) + 1
	}
}

function generate(n) {
	let sliderElements = {
		head: [],
		tail: [],
	}
	sliderElements.head.push("normal");

	for (let i = 0; i < n - 1; i++) {
		if (i % 2 === 0) {
			sliderElements.tail.push("repeat");
		} else {
			sliderElements.head.push("repeat");
		}
	}
	if ((n + 1) % 2 === 1) {
		sliderElements.head.push("normal");
	} else {
		sliderElements.tail.push("normal");
	}

	return sliderElements;
}


function animate() {
	let elements = generate(slider.totalSlides);
	if (slider.slides < slider.totalSlides) {
		slider.percent += 1;
		if (slider.percent >= 100) {
			console.log(Math.floor((slider.slides + 1) / 2));
			console.log(elements.head[Math.floor(slider.slides / 2)]);
			console.log(elements.tail[Math.floor(slider.slides / 2)]);
			slider.slides++;
			slider.percent -= 100;
			// console.log("slider reverse");
		}
	}
	ctx.lineWidth = 4;

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.beginPath();
	if (elements.head[elementIndex(slider.slides, "head")] === "normal") {
		ctx.arc(100, 100, 50, 0, 2 * Math.PI);
	} else if (elements.head[elementIndex(slider.slides, "head")] === "repeat") {
		ctx.moveTo(100, 100);
		ctx.arc(100, 100, 50, 0, 2 * Math.PI);
	}
	ctx.stroke();

	if (elements.tail[elementIndex(slider.slides, "tail")] === "normal") {
		ctx.arc(600, 100, 50, 0, 2 * Math.PI);
	} else if (elements.tail[elementIndex(slider.slides, "tail")] === "repeat") {
		ctx.moveTo(600, 100);
		ctx.arc(600, 100, 50, -Math.PI, Math.PI);
	}
	ctx.stroke();

	ctx.beginPath();
	if (slider.slides % 2 === 0) {
		ctx.arc(100 + slider.percent * 5, 100, 50, 0, 2 * Math.PI);
	} else {
		ctx.arc(600 - slider.percent * 5, 100, 50, 0, 2 * Math.PI);
	}
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(100, 50);
	ctx.lineTo(600, 50);
	ctx.arc(600, 100, 50, -Math.PI / 2, Math.PI / 2);
	ctx.moveTo(100, 150);
	ctx.lineTo(600, 150);
	ctx.arc(100, 100, 50, Math.PI / 2, -Math.PI / 2);
	ctx.stroke();

	requestAnimationFrame(animate);
}

animate();