let canvas = document.getElementById("audio-visualiser");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let ctx = canvas.getContext("2d");
let audioElement = document.getElementById("audio");

let audioCtx = new AudioContext();

let analyser = audioCtx.createAnalyser();
analyser.fftSize = 256;

let source = audioCtx.createMediaElementSource(audioElement);

source.connect(analyser);
source.connect(audioCtx.destination);

let data = new Uint8Array(analyser.frequencyBinCount);
let dataPrevious;

function map(num, numMin, numMax, mapMin, mapMax) {
	return mapMin + ((mapMax - mapMin) / (numMax - numMin)) * (num - numMin);
};
var j = 0;
var k = 0;
var l = 0;
var m = 0;
var speed = 0.1;

let opacity = 1;

function animate() {

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
	opacity -= 0.25;
	if (opacity < 0) {
		opacity = 0;
	}
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	dataPrevious = data;
	data = new Uint8Array(analyser.frequencyBinCount);
	analyser.getByteFrequencyData(data); //passing our Uint data array

	data = [...data];
	let length = data.length * 2 / 3;
	for (var i = 0; i < length; i++) {
		let value = data[i];
		let mapped = map(value, 0, 255, 0, canvas.height / 2);
		ctx.fillStyle = `rgb(${map(i, 0, length, 0, 255)}, ${map(Math.sin(j * 1), -1, 1, 0, 255)}, ${map(Math.cos(k * 1), -1, 1, 0, 255)})`;
        ctx.fillRect(map(i, 0, length, 0, canvas.width), canvas.height - mapped, 10, mapped);
        ctx.fillRect(map(i, 0, length, 0, canvas.width), mapped, 10, -mapped);
	}
	let dataSum = 0;
	let dataPreviousSum = 0;
	for (var i = 0; i < data.length; i++) {
		dataSum += data[i] * Math.sqrt(data.length - i);
	}
	for (var i = 0; i < dataPrevious.length; i++) {
		dataPreviousSum += dataPrevious[i] * Math.sqrt(dataPrevious.length - i);
	}
	// console.log(dataSum - dataPreviousSum);
	if (dataSum - dataPreviousSum > 5000) {
		console.log("beat");
		opacity += 1;
		if (opacity > 1) {
			opacity = 1;
		}
	}
    j += 0.05 * speed;
	k += 0.023 * speed;
	l += 0.046 * speed;

	requestAnimationFrame(animate);
}
animate();

window.onclick = function() {
	audioElement.play();
}

audioElement.onplay = ()=>{
    audioCtx.resume();
}

audioElement.onend = function() {
	audioElement.play()
}