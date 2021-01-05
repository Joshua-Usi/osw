function AR(n, timingMod) {
	if (timingMod === "easy") {
		n *= 0.5;
	} else if (timingMod === "hardrock") {
		n *= 1.4;
		if (n > 10) {
			n = 10;
		}
	}
	let ar;
	if (n < 5) {
		ar = 1.2 + 0.6 * (5 - n) / 5;
	} else if (n === 5) {
		ar = 1.2;
	} else if (n > 5) {
		ar = 1.2 - 0.75 * (n - 5) / 5;
	}
	return ar;
}

function CS(n, timingMod) {
	let radius = 54.4 - 4.48 * n;
	if (timingMod === "easy") {
		radius /= 0.5;
	} else if (timingMod === "hardrock") {
		radius /= 1.3;
	}
	return radius;
}

/* values for hit windows (centered around hit object time for 50, 100, 300)*/
function ODHitWindow(n, timingMod) {
	if (timingMod === "easy") {
		n *= 0.5;
	} else if (timingMod === "hardrock") {
		n *= 1.4;
		if (n > 10) {
			n = 10;
		}
	}
	/* in order 50, 100, 300*/
	return [
		0.4 - 0.02 * n,
		0.28 - 0.016 * n,
		0.16 - 0.012 * n,
	];
}

/* measured in spins per second required for clear*/
function ODSpinner(n, timingMod) {
	if (timingMod === "easy") {
		n *= 0.5;
	} else if (timingMod === "hardrock") {
		n *= 1.4;
		if (n > 10) {
			n = 10;
		}
	}
	let od;
	if (n < 5) {
		od = 5 - 2 * (5 - OD) / 5
	} else if (n === 5) {
		od = 5;
	} else if (n > 5) {
		od = 5 + 2.5 * (OD - 5) / 5;
	}
	return od;
}

/* returns loss and gain per note in array*/
function HP(n) {
	let LossPerNote = 0.75 * n + 0.75;
	let GainPerNote
	if (hp >= 9) {
		GainPerNote = -0.4 * (n + ((n - 9) / 180)) + 4
	} else {
		GainPerNote = -0.4 * n + 4;
	}
	return [
		LossPerNote,
		GainPerNote,
	]
}