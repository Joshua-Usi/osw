define(function(require) {
	const bezier = require("./Beizer.js");
	const utils = require("./utils.js");

	let canvas = document.getElementById("intro-logo");
	canvas.width = 0.8 * window.innerWidth;
	canvas.height = 0.8 * window.innerWidth;
	let ctx = canvas.getContext("2d");

	let pointArrays = [];

	function point(x, y) {
		return {
			x: x,
			y: y,
		}
	}
	function generatePoints() {
		/* generate outside circle of logo */
		pointArrays.push([]);
		for (let i = 1.5 * Math.PI; i >= -0.5 * Math.PI; i -= Math.PI / 256) {
			let x = 0.5 + Math.cos(i) * 0.5;
			let y = 0.5 + Math.sin(i) * 0.5;
			pointArrays[pointArrays.length - 1].push(point(x, y));
		}

		/* generate inside circle of logo */
		pointArrays.push([]);
		for (let i = 1.5 * Math.PI; i >= -0.5 * Math.PI; i -= Math.PI / 256) {
			let x = 0.5 + Math.cos(i) * 0.45;
			let y = 0.5 + Math.sin(i) * 0.45;
			pointArrays[pointArrays.length - 1].push(point(x, y));
		}
		/* path generated courtesy of opentype */
		let path = JSON.parse(`[{"type":"M","x":0.23970953237410078,"y":0.5995107913669064},{"type":"L","x":0.23970953237410078,"y":0.5995107913669064},{"type":"Q","x1":0.21631115107913673,"y1":0.5995107913669064,"x":0.19904091726618703,"y":0.5918970323741009},{"type":"Q","x1":0.18177068345323744,"y1":0.5842832733812949,"x":0.17044289568345325,"y":0.5707270683453237},{"type":"Q","x1":0.1591151079136691,"y1":0.5571708633093525,"x":0.15335836330935254,"y":0.5389721223021583},{"type":"Q","x1":0.147601618705036,"y1":0.5207733812949641,"x":0.147601618705036,"y":0.49960341726618707},{"type":"L","x":0.147601618705036,"y":0.49960341726618707},{"type":"Q","x1":0.147601618705036,"y1":0.47843345323741016,"x":0.15335836330935254,"y":0.45986330935251807},{"type":"Q","x1":0.1591151079136691,"y1":0.44129316546762587,"x":0.17044289568345325,"y":0.4277369604316547},{"type":"Q","x1":0.18177068345323744,"y1":0.4141807553956834,"x":0.19904091726618703,"y":0.4063812949640287},{"type":"Q","x1":0.21631115107913673,"y1":0.3985818345323741,"x":0.23970953237410078,"y":0.3985818345323741},{"type":"L","x":0.23970953237410078,"y":0.3985818345323741},{"type":"Q","x1":0.2631079136690648,"y1":0.3985818345323741,"x":0.2805638489208633,"y":0.4063812949640287},{"type":"Q","x1":0.29801978417266184,"y1":0.4141807553956834,"x":0.309533273381295,"y":0.4277369604316547},{"type":"Q","x1":0.32104676258992804,"y1":0.44129316546762587,"x":0.3266178057553957,"y":0.45986330935251807},{"type":"Q","x1":0.3321888489208633,"y1":0.47843345323741016,"x":0.3321888489208633,"y":0.49960341726618707},{"type":"L","x":0.3321888489208633,"y":0.49960341726618707},{"type":"Q","x1":0.3321888489208633,"y1":0.5207733812949641,"x":0.3266178057553957,"y":0.5389721223021583},{"type":"Q","x1":0.32104676258992804,"y1":0.5571708633093525,"x":0.309533273381295,"y":0.5707270683453237},{"type":"Q","x1":0.29801978417266184,"y1":0.5842832733812949,"x":0.2805638489208633,"y":0.5918970323741009},{"type":"Q","x1":0.2631079136690648,"y1":0.5995107913669064,"x":0.23970953237410078,"y":0.5995107913669064},{"type":"Z"},{"type":"M","x":0.23970953237410078,"y":0.5593992805755396},{"type":"L","x":0.23970953237410078,"y":0.5593992805755396},{"type":"Q","x1":0.26050809352517984,"y1":0.5593992805755396,"x":0.269607464028777,"y":0.5439860611510792},{"type":"Q","x1":0.2787068345323741,"y1":0.5285728417266187,"x":0.2787068345323741,"y":0.49960341726618707},{"type":"L","x":0.2787068345323741,"y":0.49960341726618707},{"type":"Q","x1":0.2787068345323741,"y1":0.47063399280575546,"x":0.269607464028777,"y":0.455220773381295},{"type":"Q","x1":0.26050809352517984,"y1":0.4398075539568345,"x":0.23970953237410078,"y":0.4398075539568345},{"type":"L","x":0.23970953237410078,"y":0.4398075539568345},{"type":"Q","x1":0.21928237410071943,"y1":0.4398075539568345,"x":0.2101830035971223,"y":0.455220773381295},{"type":"Q","x1":0.2010836330935252,"y1":0.47063399280575546,"x":0.2010836330935252,"y":0.49960341726618707},{"type":"L","x":0.2010836330935252,"y":0.49960341726618707},{"type":"Q","x1":0.2010836330935252,"y1":0.5285728417266187,"x":0.2101830035971223,"y":0.5439860611510792},{"type":"Q","x1":0.21928237410071943,"y1":0.5593992805755396,"x":0.23970953237410078,"y":0.5593992805755396},{"type":"Z"},{"type":"M","x":0.43395323741007197,"y":0.5181735611510792},{"type":"L","x":0.41092625899280577,"y":0.511488309352518},{"type":"Q","x1":0.39012769784172663,"y1":0.5055458633093526,"x":0.37842850719424465,"y":0.49384667266187054},{"type":"Q","x1":0.3667293165467626,"y1":0.4821474820143884,"x":0.3667293165467626,"y":0.45874910071942443},{"type":"L","x":0.3667293165467626,"y":0.45874910071942443},{"type":"Q","x1":0.3667293165467626,"y1":0.4305224820143885,"x":0.386970773381295,"y":0.4145521582733812},{"type":"Q","x1":0.4072122302158273,"y1":0.3985818345323741,"x":0.44212410071942454,"y":0.3985818345323741},{"type":"L","x":0.44212410071942454,"y":0.3985818345323741},{"type":"Q","x1":0.4566088129496403,"y1":0.3985818345323741,"x":0.4707221223021582,"y":0.401181654676259},{"type":"Q","x1":0.48483543165467624,"y1":0.4037814748201438,"x":0.4993201438848921,"y":0.4089811151079137},{"type":"L","x":0.4993201438848921,"y":0.4089811151079137},{"type":"Q","x1":0.49857733812949645,"y1":0.41863758992805755,"x":0.49560611510791364,"y":0.4290368705035971},{"type":"Q","x1":0.49263489208633093,"y1":0.4394361510791367,"x":0.4885494604316547,"y":0.4472356115107914},{"type":"L","x":0.4885494604316547,"y":0.4472356115107914},{"type":"Q","x1":0.47963579136690637,"y1":0.443521582733813,"x":0.46886510791366914,"y":0.44073606115107916},{"type":"Q","x1":0.45809442446043164,"y1":0.4379505395683454,"x":0.4462095323741007,"y":0.4379505395683454},{"type":"L","x":0.4462095323741007,"y":0.4379505395683454},{"type":"Q","x1":0.43358183453237414,"y1":0.4379505395683454,"x":0.42652517985611504,"y":0.44185026978417263},{"type":"Q","x1":0.4194685251798561,"y1":0.44575,"x":0.4194685251798561,"y":0.4542922661870504},{"type":"L","x":0.4194685251798561,"y":0.4542922661870504},{"type":"Q","x1":0.4194685251798561,"y1":0.4624631294964029,"x":0.424482464028777,"y":0.4658057553956835},{"type":"Q","x1":0.42949640287769786,"y1":0.469148381294964,"x":0.43878147482014385,"y":0.47211960431654676},{"type":"L","x":0.43878147482014385,"y":0.47211960431654676},{"type":"L","x":0.4599514388489208,"y":0.47843345323741016},{"type":"Q","x1":0.4703507194244604,"y1":0.48140467625899286,"x":0.47870728417266184,"y":0.485675809352518},{"type":"Q","x1":0.4870638489208633,"y1":0.4899469424460432,"x":0.4930062949640288,"y":0.4962607913669065},{"type":"Q","x1":0.49894874100719433,"y1":0.5025746402877698,"x":0.5022913669064748,"y":0.5118597122302159},{"type":"Q","x1":0.5056339928057554,"y1":0.5211447841726619,"x":0.5056339928057554,"y":0.5345152877697842},{"type":"L","x":0.5056339928057554,"y":0.5345152877697842},{"type":"Q","x1":0.5056339928057554,"y1":0.5482571942446043,"x":0.49987724820143886,"y":0.5601420863309352},{"type":"Q","x1":0.49412050359712245,"y1":0.5720269784172661,"x":0.48316411870503595,"y":0.5807549460431655},{"type":"Q","x1":0.47220773381294967,"y1":0.5894829136690647,"x":0.4566088129496403,"y":0.5944968525179857},{"type":"Q","x1":0.4410098920863309,"y1":0.5995107913669064,"x":0.4213255395683453,"y":0.5995107913669064},{"type":"L","x":0.4213255395683453,"y":0.5995107913669064},{"type":"Q","x1":0.4124118705035971,"y1":0.5995107913669064,"x":0.4049838129496403,"y":0.5989536870503597},{"type":"Q","x1":0.3975557553956835,"y1":0.598396582733813,"x":0.39068480215827334,"y":0.5970966726618705},{"type":"Q","x1":0.3838138489208633,"y1":0.5957967625899281,"x":0.3771285971223022,"y":0.5939397482014388},{"type":"Q","x1":0.370443345323741,"y1":0.5920827338129496,"x":0.3626438848920863,"y":0.5891115107913669},{"type":"L","x":0.3626438848920863,"y":0.5891115107913669},{"type":"Q","x1":0.363386690647482,"y1":0.5790836330935252,"x":0.3661722122302158,"y":0.5688700539568345},{"type":"Q","x1":0.3689577338129496,"y1":0.5586564748201439,"x":0.3734145683453237,"y":0.549},{"type":"L","x":0.3734145683453237,"y":0.549},{"type":"Q","x1":0.3856708633093525,"y1":0.5538282374100719,"x":0.39662724820143885,"y":0.556242356115108},{"type":"Q","x1":0.40758363309352513,"y1":0.5586564748201439,"x":0.4194685251798561,"y":0.5586564748201439},{"type":"L","x":0.4194685251798561,"y":0.5586564748201439},{"type":"Q","x1":0.42466816546762587,"y1":0.5586564748201439,"x":0.4307963129496402,"y":0.5577279676258993},{"type":"Q","x1":0.43692446043165467,"y1":0.5567994604316547,"x":0.44212410071942454,"y":0.5543853417266187},{"type":"Q","x1":0.44732374100719424,"y1":0.5519712230215829,"x":0.45085206834532376,"y":0.5480714928057554},{"type":"Q","x1":0.4543803956834532,"y1":0.5441717625899282,"x":0.4543803956834532,"y":0.5378579136690648},{"type":"L","x":0.4543803956834532,"y":0.5378579136690648},{"type":"Q","x1":0.4543803956834532,"y1":0.5289442446043165,"x":0.4489950539568346,"y":0.5250445143884892},{"type":"Q","x1":0.44360971223021584,"y1":0.5211447841726619,"x":0.43395323741007197,"y":0.5181735611510792},{"type":"L","x":0.43395323741007197,"y":0.5181735611510792},{"type":"Z"},{"type":"M","x":0.5412886690647482,"y":0.5062886690647482},{"type":"L","x":0.5412886690647482,"y":0.4030386690647482},{"type":"Q","x1":0.5546591726618705,"y1":0.4008102517985611,"x":0.5676582733812949,"y":0.4008102517985611},{"type":"L","x":0.5676582733812949,"y":0.4008102517985611},{"type":"Q","x1":0.5806573741007194,"y1":0.4008102517985611,"x":0.5940278776978417,"y":0.4030386690647482},{"type":"L","x":0.5940278776978417,"y":0.4030386690647482},{"type":"L","x":0.5940278776978417,"y":0.5048030575539568},{"type":"Q","x1":0.5940278776978417,"y1":0.5200305755395683,"x":0.5964419964028778,"y":0.5298727517985611},{"type":"Q","x1":0.5988561151079136,"y1":0.5397149280575539,"x":0.6038700539568345,"y":0.5454716726618705},{"type":"Q","x1":0.6088839928057554,"y1":0.551228417266187,"x":0.6163120503597123,"y":0.553642535971223},{"type":"Q","x1":0.6237401079136691,"y1":0.556056654676259,"x":0.6337679856115108,"y":0.556056654676259},{"type":"L","x":0.6337679856115108,"y":0.556056654676259},{"type":"Q","x1":0.6475098920863309,"y1":0.556056654676259,"x":0.6567949640287769,"y":0.553456834532374},{"type":"L","x":0.6567949640287769,"y":0.553456834532374},{"type":"L","x":0.6567949640287769,"y":0.4030386690647482},{"type":"Q","x1":0.6701654676258993,"y1":0.4008102517985611,"x":0.6827931654676259,"y":0.4008102517985611},{"type":"L","x":0.6827931654676259,"y":0.4008102517985611},{"type":"Q","x1":0.6957922661870504,"y1":0.4008102517985611,"x":0.7091627697841728,"y":0.4030386690647482},{"type":"L","x":0.7091627697841728,"y":0.4030386690647482},{"type":"L","x":0.7091627697841728,"y":0.5876258992805755},{"type":"Q","x1":0.6972778776978418,"y1":0.5917113309352517,"x":0.6777792266187052,"y":0.5956110611510791},{"type":"Q","x1":0.6582805755395684,"y1":0.5995107913669064,"x":0.6371106115107913,"y":0.5995107913669064},{"type":"L","x":0.6371106115107913,"y":0.5995107913669064},{"type":"Q","x1":0.6181690647482014,"y1":0.5995107913669064,"x":0.6007131294964029,"y":0.5965395683453237},{"type":"Q","x1":0.5832571942446043,"y1":0.593568345323741,"x":0.5700723920863309,"y":0.5839118705035972},{"type":"Q","x1":0.5568875899280575,"y1":0.5742553956834533,"x":0.5490881294964028,"y":0.5556852517985611},{"type":"Q","x1":0.5412886690647482,"y1":0.537115107913669,"x":0.5412886690647482,"y":0.5062886690647482},{"type":"L","x":0.5412886690647482,"y":0.5062886690647482},{"type":"Z"},{"type":"M","x":0.7615305755395684,"y":0.5096312949640288},{"type":"L","x":0.75781654676259,"y":0.32801528776978417},{"type":"Q","x1":0.7723012589928059,"y1":0.32578687050359706,"x":0.7864145683453238,"y":0.32578687050359706},{"type":"L","x":0.7864145683453238,"y":0.32578687050359706},{"type":"Q","x1":0.8008992805755397,"y1":0.32578687050359706,"x":0.8153839928057555,"y":0.32801528776978417},{"type":"L","x":0.8153839928057555,"y":0.32801528776978417},{"type":"L","x":0.811669964028777,"y":0.5096312949640288},{"type":"Q","x1":0.7986708633093526,"y1":0.5118597122302159,"x":0.7867859712230215,"y":0.5118597122302159},{"type":"L","x":0.7867859712230215,"y":0.5118597122302159},{"type":"Q","x1":0.774158273381295,"y1":0.5118597122302159,"x":0.7615305755395684,"y":0.5096312949640288},{"type":"L","x":0.7615305755395684,"y":0.5096312949640288},{"type":"Z"},{"type":"M","x":0.7593021582733813,"y":0.5950539568345324},{"type":"L","x":0.7593021582733813,"y":0.5950539568345324},{"type":"Q","x1":0.7570737410071943,"y1":0.5813120503597122,"x":0.7570737410071943,"y":0.5679415467625899},{"type":"L","x":0.7570737410071943,"y":0.5679415467625899},{"type":"Q","x1":0.7570737410071943,"y1":0.5545710431654677,"x":0.7593021582733813,"y":0.5404577338129496},{"type":"L","x":0.7593021582733813,"y":0.5404577338129496},{"type":"Q","x1":0.7730440647482014,"y1":0.5382293165467626,"x":0.7864145683453238,"y":0.5382293165467626},{"type":"L","x":0.7864145683453238,"y":0.5382293165467626},{"type":"Q","x1":0.7997850719424461,"y1":0.5382293165467626,"x":0.8138983812949641,"y":0.5404577338129496},{"type":"L","x":0.8138983812949641,"y":0.5404577338129496},{"type":"Q","x1":0.8161267985611511,"y1":0.5545710431654677,"x":0.8161267985611511,"y":0.5675701438848921},{"type":"L","x":0.8161267985611511,"y":0.5675701438848921},{"type":"Q","x1":0.8161267985611511,"y1":0.5813120503597122,"x":0.8138983812949641,"y":0.5950539568345324},{"type":"L","x":0.8138983812949641,"y":0.5950539568345324},{"type":"Q","x1":0.7997850719424461,"y1":0.5972823741007194,"x":0.7867859712230215,"y":0.5972823741007194},{"type":"L","x":0.7867859712230215,"y":0.5972823741007194},{"type":"Q","x1":0.7730440647482014,"y1":0.5972823741007194,"x":0.7593021582733813,"y":0.5950539568345324},{"type":"Z"}]`);
		let p = 0
		ctx.strokeStyle = "#fff";
		let pathPoints = [];
		let beginningIndex = 0;
		for (var i = 0; i < path.length; i++) {
			if (path[i].type === "M") {
				pathPoints = [];
				beginningIndex = i;
				pathPoints.push(point(path[i].x, path[i].y));
				p++;
			}
			if (path[i].type === "L") {
				let points = bezier([{x: path[i - 1].x, y: path[i - 1].y}, {x: path[i].x, y: path[i].y}], 0.01);
				for (var j = 0; j < points.length; j++) {
					pathPoints.push(point(points[j].x, points[j].y));
					p++;
				}
			}
			if (path[i].type === "C") {
				let points = bezier([{x: path[i - 1].x, y: path[i - 1].y}, {x: path[i].x1, y: path[i].y1}, {x: path[i].x2, y: path[i].y2}, {x: path[i].x, y: path[i].y}], 0.01);
				for (var j = 0; j < points.length; j++) {
					pathPoints.push(point(points[j].x, points[j].y));
					p++;
				}
			}
			if (path[i].type === "Q") {
				let points = bezier([{x: path[i - 1].x, y: path[i - 1].y}, {x: path[i].x1, y: path[i].y1}, {x: path[i].x, y: path[i].y}], 0.01);
				for (var j = 0; j < points.length; j++) {
					pathPoints.push(point(points[j].x, points[j].y));
					p++;
				}
			}
			if (path[i].type === "Z") {
				pathPoints.push(point(path[beginningIndex].x, path[beginningIndex].y));
				pointArrays.push(pathPoints);
			}
		}
	}
	generatePoints();

	let l = 0.05;
	let lPrevious = l;
	function draw() {
		let audio = document.getElementById("menu-audio");
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.lineWidth = 3;
		for (let i = 0; i < pointArrays.length; i++) {
			ctx.strokeStyle = "#fff9";
			ctx.beginPath();
			let maxIndex = pointArrays[i].length - (utils.map(l, 0, 1, pointArrays[i].length, 0) ** 4 / pointArrays[i].length ** 3);
			if (maxIndex > pointArrays[i].length) {
				maxIndex = pointArrays[i].length;
			}
			if (i === 1 || i === 3) {
				maxIndex = pointArrays[i].length;	
			}
			for (let j = 0; j < maxIndex; j++) {
				ctx.lineTo(pointArrays[i][j].x * canvas.height, pointArrays[i][j].y * canvas.height);
			}
			ctx.stroke();
			ctx.strokeStyle = "#fff";
			ctx.beginPath();
			let starting = Math.floor(maxIndex - (pointArrays[i].length - maxIndex) / 1.5);
			if (starting < 0) {
				starting = 0;
			}
			for (let j = starting; j < maxIndex; j++) {
				ctx.lineTo(pointArrays[i][j].x * canvas.height, pointArrays[i][j].y * canvas.height);
			}
			ctx.stroke();
		}
		if (audio.currentTime >= 2.2 && audio.currentTime <= 3.1) {
			lPrevious = l;
			l = utils.map(audio.currentTime, 2.2, 3.3, 0.05, 1);
		}
		if (eventDone[8] === false) {
			requestAnimationFrame(draw);
		}
	}



	let first = true;
	window.addEventListener("click", function() {
		if (first) {
			animate();
		}
	});

	function setPositions(elements, width, newWidth, range, newRange) {
		for (let i = 0; i < elements.length; i++) {
			elements[i].style.width = newWidth + "vh";
			elements[i].style.top = (50 - newWidth / 2) + "vh";
			elements[i].style.left = 50 - newWidth / 4 + utils.map(i, 0, elements.length - 1, -newRange, newRange) + "vw";
		}
	}

	let eventDone = [false, false, false, false, false, false, false, false, false];

	let triangleNumber = 0;

	let numberOfTriangles = 22;
	let timeBetweenEachTriangle = 0.022;
	let triangleFadeOutTime = 0.24; 

	function createTriangle(type, x, y, size, triangleN) {
		let speed = 1 / document.getElementById("menu-audio").playbackRate;
		document.getElementById("triangles-container").innerHTML += `<svg class="intro-triangle" id="triangle-${triangleN}" style="position: absolute; top: ${y}px; left: ${x};" height="${size}" width="${size}">
		<polygon points="${size * 3 / 6},${size / 6} ${size * 5 / 6},${size * 5 / 6} ${size / 6},${size * 5 / 6}" style="fill:${(type === 0) ? "white" : "transparent"};stroke:white;stroke-width:2" />
		</svg>`
		document.getElementById(`triangle-${triangleN}`).querySelector("polygon").style.animation = `${triangleFadeOutTime * speed}s ease ${0.9 * speed + triangleN * 0.022 * speed + "s"} 1 normal none running fade-in-out`;
	}

	function animate() {
		let audio = document.getElementById("menu-audio");
		while (triangleNumber <= numberOfTriangles && audio.currentTime > 0.1) {
			createTriangle(utils.randomInt(0, 1), utils.randomInt(window.innerWidth * 0.3, window.innerWidth * 0.7), utils.randomInt(window.innerHeight * 0.4, window.innerHeight * 0.6), utils.randomInt(10, 120), triangleNumber);
			triangleNumber++;
		}
		if (audio.currentTime >= 0.2 && eventDone[0] === false) {
			document.getElementById("intro-text").textContent = "wel";
			eventDone[0] = true;
		}
		if (audio.currentTime >= 0.4 && eventDone[1] === false) {
			document.getElementById("intro-text").textContent = "welcome";
			eventDone[1] = true;
		}
		if (audio.currentTime >= 0.6 && eventDone[2] === false) {
			document.getElementById("intro-text").textContent = "welcome to";
			eventDone[2] = true;
		}
		if (audio.currentTime >= 0.9 && eventDone[3] === false) {
			document.getElementById("intro-text").textContent = "welcome to osu!";
			document.getElementById("intro-text").style.letterSpacing = "0.75vh";
			eventDone[3] = true;
		}
		if (audio.currentTime >= 1.6 && eventDone[4] === false) {
			let introGamemodes = document.getElementsByClassName("intro-gamemodes");
			document.getElementById("intro-text").style.display = "none";
			setPositions(document.getElementsByClassName("intro-gamemodes"), 4, 3.5, 25, 24);
			eventDone[4] = true;
		}
		if (audio.currentTime >= 1.8 && eventDone[5] === false) {
			let introGamemodes = document.getElementsByClassName("intro-gamemodes");
			document.getElementById("intro-text").style.display = "none";
			setPositions(document.getElementsByClassName("intro-gamemodes"), 8, 7, 12.5, 11);
			eventDone[5] = true;
		}
		if (audio.currentTime >= 2 && eventDone[6] === false) {
			let introGamemodes = document.getElementsByClassName("intro-gamemodes");
			document.getElementById("intro-text").style.display = "none";
			setPositions(document.getElementsByClassName("intro-gamemodes"), 16, 18, 17.5, 20);
			eventDone[6] = true;
		}
		if (audio.currentTime >= 2.2 && eventDone[7] === false) {
			let introGamemodes = document.getElementsByClassName("intro-gamemodes");
			for (let i = 0; i < introGamemodes.length; i++) {
				introGamemodes[i].style.display = "none";
			}
			document.getElementById("intro-logo").style.display = "block";
			document.getElementById("intro-logo").style.top = "calc(50vh - 70vh / 2)";
			document.getElementById("intro-logo").style.left = "calc(50vw - 70vh / 2)";
			document.getElementById("intro-logo").style.width = "70vh";
			document.getElementById("intro-logo").style.height = "70vh";
			draw();
			eventDone[7] = true;
		}
		if (audio.currentTime >= 3.1 && eventDone[8] === false) {
			let introGamemodes = document.getElementsByClassName("intro-gamemodes");
			document.getElementById("intro").style.background = "#fff";
			document.getElementById("intro").style.opacity = 0;
			for (let i = 0; i < introGamemodes.length; i++) {
				introGamemodes[i].style.display = "none";
			}
			document.getElementById("intro-logo").style.display = "none";
			eventDone[8] = true;
			setTimeout(function() {
				document.getElementById("intro").style.display = "none"
			}, 750);
		}
		if (eventDone[8] === false) {
			requestAnimationFrame(animate);
		}
	}
});