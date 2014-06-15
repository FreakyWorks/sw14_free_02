Ext.require('Muzic.util.Database');


describe("Muzic.util.Database", function () {
	describe("Database loader", function () {
	    it("has loaded our database", function () {
	    	Muzic.util.Database.openDB();
	        expect(Muzic.util.Database.getDatabase()).toBeDefined();
	    });
	});
	
	describe("Table creator", function () {
		  beforeEach(function(done) {
		  		Muzic.util.Database.createTables();
			    setTimeout(function() {
			      done();
			    }, 2000);
		  });
		
	    it("has created our tables", function () {
	    	var myDb = Muzic.util.Database.getDatabase();
	    	myDb.transaction(function (tx) {
				tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='songs_table';", [], function (tx, results) {
					console.log(results);
					expect(results.rows.length).toBe(1);
				}, function() {
					expect(results.rows.length).toBe(1);
				});
				tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='artists_table';", [], function (tx, results) {
					console.log(results);
					expect(results.rows.length).toBe(1);
				}, function() {
					expect(results.rows.length).toBe(1);
				});
			});
	    });
	});
	
	describe("Song inserter", function () {
		var entries_to_add = 10;
		  beforeEach(function(done) {
		  		var myDb = Muzic.util.Database.getDatabase();
		  		
		    	for(var counter = 0; counter < entries_to_add; counter++) {
		    		Muzic.util.Database.addEntry("MySong", "MyArtist", "file:///mypath/mysong.mp3");
		    	}
		    	Muzic.util.Database.addEntry("MySong", "Another Artist", "file:///mypath/mysong1.mp3");
			    setTimeout(function() {
			      done();
			    }, 2000);
		  });
		
		it("has inserted two tracks with MySong as title", function () {
			var myDb = Muzic.util.Database.getDatabase();
			myDb.transaction(function (tx) {
				tx.executeSql("SELECT * FROM songs_table WHERE title='MySong';", [], function (tx, results) {
					console.log("Got result");
					console.log(results);
					expect(results.rows.length).toBe(2);
				}, function(err) {
					console.log(err);
					expect(results.rows.length).toBe(2);
				});
			});
		});
		it("has added two artists", function () {
			var myDb = Muzic.util.Database.getDatabase();
			myDb.transaction(function (tx) {
				tx.executeSql("SELECT * FROM artists_table WHERE artist_name='MyArtist' OR artist_name = 'Another Artist';", [], function (tx, results) {
					console.log(results);
					expect(results.rows.length).toBe(2);
				}, function(err) {
					expect(results.rows.length).toBe(2);
					console.log(err);
				});
			});
		});
		it("has created two different tracks", function () {
			var myDb = Muzic.util.Database.getDatabase();
			myDb.transaction(function (tx) {
				tx.executeSql("SELECT * FROM songs_table WHERE title='MySong';", [], function (tx, results) {
					console.log(results);
					expect(results.rows.item(results.rows.length - 1).artist_id).not.toBe(results.rows.item(results.rows.length - 2).artist_id);
				}, function(err) {
					expect(results.rows.item(results.rows.length - 1).artist_id).not.toBe(results.rows.item(results.rows.length - 2).artist_id);
					console.log(err);
				});
			});
		});

	});
	

	
	describe("Song deleter", function () {
		var old_number_of_artists = undefined;
		  beforeEach(function(done) {
		  		var myDb = Muzic.util.Database.getDatabase();
				myDb.transaction(function (tx) {
						tx.executeSql("SELECT * FROM artists_table WHERE artist_name='Another Artist';", [], function (tx, results) {
							console.log(results);
							old_occurences = results.rows.length;
						}, null);
				});
				Muzic.util.Database.deleteEntry("file:///mypath/mysong1.mp3");
				
			    setTimeout(function() {
			      done();
			    }, 2000);
		  });
		
		
		it("has deleted our second insert", function () {
			var myDb = Muzic.util.Database.getDatabase();
			myDb.transaction(function (tx) {
				tx.executeSql("SELECT * FROM songs_table WHERE title='MySong';", [], function (tx, results) {
					console.log("Got result");
					console.log(results);
					expect(results.rows.length).toBe(1);
				}, function(err) {
					console.log(err);
					expect(results.rows.length).toBe(1);
				});
				myDb.transaction(function (tx) {
						tx.executeSql("SELECT * FROM artists_table WHERE artist_name='Another Artist';", [], function (tx, results) {
							console.log(results);
							expect(old_occurences - results.rows.length).toBe(1);
						}, null);
				});
			});
		});


	});
	
	
	describe("Database entries checker", function () {
		beforeEach(function(done) {
		  	spyOn(Muzic.util.FileRead, 'checkIfFileExists');
		  	Muzic.util.Database.checkIfAllDBEntriesExist();
		    setTimeout(function() {
		      done();
		    }, 2000);
		});
		it("has called our file checker", function() {
			expect(Muzic.util.FileRead.checkIfFileExists).toHaveBeenCalled();
		});
	});
	
	describe("Model Creator", function () {
		it("has returned our model", function() {
			var model = Muzic.util.Database.createModel( { filepath : 'samplepath' } );
			
			expect(model).toBeDefined();
			console.log(model);
			expect(model.data.filepath).toMatch('samplepath');
		});
	});

	describe("Model to store adder", function () {
		var store;
		beforeEach(function(done) {
			console.log("before");
			jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
		  	store = Muzic.util.Database.requestStore('Songs');
		  	console.log(store);
		    setTimeout(function() {
		      done();
		    }, 3000);
		});
		it("has stored our model to the store", function() {
			Muzic.util.Database.addModelToStore(Muzic.util.Database.createModel( { filepath : 'samplepath' } ), store);
			console.log(store.data.all);
			var data = store.data.all;
			expect(data).toBeDefined();
			var lastItem = data[data.length - 1].data;
			expect(lastItem).toBeDefined();
			expect(lastItem.filepath).toMatch('samplepath');
			//done();
		});
		it("should fail but keep existing data intact", function() {
			Muzic.util.Database.addModelToStore(undefined, store);
			var data = store.data.all;
			var lastItem = data[data.length - 1].data;
			expect(lastItem.filepath).toMatch('samplepath');
			//done();
		});
	});
	
	
	describe("Entry to store adder", function () {
		var store;
		beforeEach(function(done) {
			console.log("before");
			jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
		  	store = Muzic.util.Database.requestStore('Songs');
		  	console.log(store);
		    setTimeout(function() {
		      done();
		    }, 3000);
		});
		it("has stored our model to the store", function() {
			Muzic.util.Database.addModelToStore(Muzic.util.Database.createModel( { filepath : 'samplepath' } ), store);
			console.log(store.data.all);
			var data = store.data.all;
			expect(data).toBeDefined();
			var lastItem = data[data.length - 1].data;
			expect(lastItem).toBeDefined();
			expect(lastItem.filepath).toMatch('samplepath');
			//done();
		});
		it("should fail but keep existing data intact", function() {
			Muzic.util.Database.addModelToStore(undefined, store);
			var data = store.data.all;
			var lastItem = data[data.length - 1].data;
			expect(lastItem.filepath).toMatch('samplepath');
			//done();
		});
	});
	
	
	describe("addAllEntriesToStore", function () {
		var songs_count = undefined;
		beforeEach(function(done) {
			console.log("before");
			jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
			var myDb = Muzic.util.Database.getDatabase();
			myDb.transaction(function (tx) {
				tx.executeSql("SELECT * FROM songs_table;", [], function (tx, results) {
					console.log("Got result");
					console.log(results);
					songs_count = results.rows.length;
				}, function(err) {
					console.log(err);
					expect(results.rows.length).toBe(1);
				});
			});
		  	//Muzic.util.Database.requestDir('Music');
		    setTimeout(function() {
		      done();
		    }, 3000);
		});
		
		
		it("has added all entries to the store, crash.mp3, crash1.mp3 exists", function() {
			Muzic.util.Database.addAllEntriesToStore('Songs', false);
			var data = Muzic.util.Database.getStore().data.all;
			//var previousItem = data[data.length - 2].data;
			//var lastItem = data[data.length - 1].data;
			expect(Muzic.util.Database.getStore().getCount()).toBeGreaterThan(0);
			var found_crashmp3 = false;
			var found_crash1mp3 = false;
			//Expecting that folder contains both crash.mp3 and crash1.mp3
			for (var counter = 0; counter < data.length; counter++) {
				console.log("JROEHWER");
				console.log(data[counter].data.filepath);
				if (data[counter].data.filepath === 'file:///storage/sdcard/Music/crash.mp3') {
					found_crashmp3 = true;
				}
				if (data[counter].data.filepath === 'file:///storage/sdcard/Music/crash1.mp3') {
					found_crash1mp3 = true;
				}
			}
			expect(found_crashmp3).toBeTruthy();
			expect(found_crash1mp3).toBeTruthy();
		});
		
		it("has deleted old entries and stored new entries to the store", function() {
			Muzic.util.Database.addAllEntriesToStore('Songs', true);
			console.log("Songs count: " + songs_count);
			expect(Muzic.util.Database.getStore().getCount()).toBe(songs_count);
		});
	});
	
	describe("addAllEntriesToArtistStore", function () {
		it("has added entries to the store", function() {
			Muzic.util.Database.addAllEntriesToStore('Songs', false);
			expect(Muzic.util.Database.getStore().getCount()).toBeGreaterThan(0);
		});
	});
	
	describe("Store", function () {
		var store;
		 beforeEach(function(done) {
		 	jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
		  	store = Muzic.util.Database.requestStore('blablabla');
		  	console.log(store);
		    setTimeout(function() {
		      done();
		    }, 4000);
		});
		
		it("should not load", function(done) {
			expect(store).toBeUndefined();
			done();
		});
	});
	describe("Store", function () {
		var store;
		 beforeEach(function(done) {
		 	jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
		  	store = Muzic.util.Database.requestStore('Songs');
		  	console.log(store);
		    setTimeout(function() {
		      done();
		    }, 4000);
		});
		
		it("Songs has been loaded and saved", function(done) {
			console.log(store);
			expect(store).toBeDefined();
			expect(store.getStoreId()).toBe('Songs');
			var savedStore = Muzic.util.Database.getStore();
			expect(savedStore).toBeDefined();
			expect(savedStore.getStoreId()).toBe('Songs');
			done();
		});
	});
	
	
});

