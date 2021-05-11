define(function(require) {
	return {
		getObjectStore: function(database, store, mode) {
			let transaction = database.transaction(store, mode);
			return transaction.objectStore(store);
		},
		addToDatabase: function(database, store, key, data) {
			let object = {
				name: key,
				data: data,
			};
			let objectStore = this.getObjectStore(database, store, "readwrite");
			let request = objectStore.add(object);
			request.addEventListener("error", function(event) {
				console.error(`Attempt to insert into object store ${store} failed: ${event.target.error}`);
			});
		},
		getAllInDatabase: function(database, store, asyncReturns) {
			let objectStore = this.getObjectStore(database, store, "readonly");
			let request = objectStore.openCursor();
			request.addEventListener("error", function(event) {
				console.error(`Attempt to fetch data from object store ${store} failed: ${event.target.error}`);
			});
			request.addEventListener("success", function(event) {
				let cursor = event.target.result;
				if (cursor) {
					let value = cursor.value;
					asyncReturns.values.push(value);
					cursor.continue();
				} else {
					asyncReturns.complete = true;
				}
			});
		}
	}
});