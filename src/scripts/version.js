define(function() {
	/* osw! version incremented manually */
	const BUILD_PREFIX = "osw! v";
	const MAJOR_VERSION = 0;
	const MINOR_VERSION = 11;
	const PATCH_VERSION = 1;
	const BUILD_METADATA = "b-dev";
	const version = `${BUILD_PREFIX}${MAJOR_VERSION}.${MINOR_VERSION}.${PATCH_VERSION}${BUILD_METADATA}`;
	return version;
});