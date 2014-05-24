Ext.require('Muzic.util.Database');


describe("Muzic.util.Database", function () {
	describe("Database loader", function () {
	    it("has loaded our database", function () {
	    	Muzic.util.Database.openDB();
	        expect(Muzic.util.Database.getDatabase()).toBeDefined();
	    });
	});
	
	describe("Table creator", function () {
	    it("has created our tables", function () {
	    	Muzic.util.Database.createTables();
	    	var myDb = Muzic.util.Database.getDatabase();
	    	myDb.transaction(function (tx) {
				tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='songs_table';", [], function (tx, results) {
					console.log(results);
					expect(results.rows.length).toBe(1);
				}, null);
			});
	    });
	});
	
	describe("Song inserter", function () {
		var old_occurences = 0;
		var entries_to_add = 10;
		  beforeEach(function(done) {
		  		var myDb = Muzic.util.Database.getDatabase();
				myDb.transaction(function (tx) {
						tx.executeSql("SELECT * FROM songs_table WHERE title='MySong';", [], function (tx, results) {
							console.log(results);
							old_occurences = results.rows.length;
						}, null);
				});
		    	for(var counter = 0; counter < entries_to_add; counter++) {
		    		Muzic.util.Database.addEntry("MySong", "file:///mypath/mysong.mp3");
		    	}
			    setTimeout(function() {
			      done();
			    }, 2000);
		  });
		it("has inserted ten songs", function () {
			var myDb = Muzic.util.Database.getDatabase();
			myDb.transaction(function (tx) {
				tx.executeSql("SELECT * FROM songs_table WHERE title='MySong';", [], function (tx, results) {
					console.log(results);
					expect(results.rows.length - old_occurences).toBe(entries_to_add);
				}, null);
			});
		});
	});
});

