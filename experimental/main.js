document.getElementById("beatmap").addEventListener("change", (event) => {
	const fileList = event.target.files;
	readFile(fileList[0]);
});

function getMetadataForFileList(fileList) {
	for (const file of fileList) {
		// Not supported in Safari for iOS.
		const name = file.name ? file.name : "NOT SUPPORTED";
		// Not supported in Firefox for Android or Opera for Android.
		const type = file.type ? file.type : "NOT SUPPORTED";
		// Unknown cross-browser support.
		const size = file.size ? file.size : "NOT SUPPORTED";
		console.log({file, name, type, size});
	}
}

function readFile(file) {
	const reader = new FileReader();
	reader.addEventListener("load", (event) => {
		const result = event.target.result;
		// Do something with result
	});

	reader.addEventListener("progress", (event) => {
		if (event.loaded && event.total) {
			const percent = (event.loaded / event.total) * 100;
			console.log(`Progress: ${Math.round(percent)}`);
		}
	});
	console.log(reader.readAsDataURL(file));
}