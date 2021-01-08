class MapSet {
	constructor(maps) {
		if (typeof(maps) !== "object") {
			maps = [];
		}
		this.beatMaps = maps;
	}
	add(beatMapString) {
		this.beatMaps.push(beatMapString);
	}
}