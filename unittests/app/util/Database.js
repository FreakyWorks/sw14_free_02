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
					expect(0).toBe(1);
				});
				tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='artists_table';", [], function (tx, results) {
					console.log(results);
					expect(results.rows.length).toBe(1);
				}, function() {
					expect(0).toBe(1);
				});
			});
	    });
	});
	
	describe("Song inserter", function () {
		var old_occurences = 0;
		var entries_to_add = 10;
		  beforeEach(function(done) {
		  		var myDb = Muzic.util.Database.getDatabase();
				myDb.transaction(function (tx) {
						tx.executeSql("SELECT * FROM songs_table WHERE title='MySong' AND artist_name='MyArtist';", [], function (tx, results) {
							console.log(results);
							old_occurences = results.rows.length;
						}, null);
				});
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
					expect(results.rows.item(results.rows.length - 1).song_artist_id).not.toBe(results.rows.item(results.rows.length - 2).song_artist_id);
				}, function(err) {
					expect(results.rows.item(results.rows.length - 1).song_artist_id).not.toBe(results.rows.item(results.rows.length - 2).song_artist_id);
					console.log(err);
				});
			});
		});

	});
});

