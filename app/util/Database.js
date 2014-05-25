Ext.define('Muzic.util.Database', {

	singleton: true,
	autoDestroy: false,
	config : {
        database : undefined
   },

	constructor : function(config) {
		this.initConfig(config);
		this.callParent([config]);
	},

	openDB : function () {
		Muzic.util.Database.setDatabase(window.sqlitePlugin.openDatabase({name: "MusicDatabase"}));
	},
	
	createTables: function () {
		if (Muzic.util.Database.getDatabase() === undefined) {
			Muzic.util.Database.openDB();
		}
		var myDb = Muzic.util.Database.getDatabase();
		myDb.transaction(function(tx) {
        tx.executeSql('PRAGMA foreign_keys = ON;');
		tx.executeSql('CREATE TABLE IF NOT EXISTS artists_table(artist_id integer primary key, artist_name text unique);');
	    tx.executeSql('CREATE TABLE IF NOT EXISTS songs_table(song_id integer primary key, song_artist_id integer , title text, filepath text, FOREIGN KEY(song_artist_id) REFERENCES artists_table(artist_id), UNIQUE(song_artist_id, title, filepath));');
		//TODO add table for album if id3 reader works
      });
	},
	
	addEntry: function (new_title, new_artist, new_filepath) {
		if (Muzic.util.Database.getDatabase() === undefined) {
			Muzic.util.Database.openDB();
		}
		var myDb = Muzic.util.Database.getDatabase();
		
		myDb.transaction(function(tx) {
	        tx.executeSql("INSERT OR IGNORE INTO artists_table(artist_name) VALUES (?);",
		        [new_artist],
		        function(tx, results) {
		        	console.log("added new artist: " + new_artist);
		        	console.log(tx);
		        	console.log(results);
  
	        	},
		        function(err) {
		        	console.log(err);
		        	console.log("creating new artist failed: " + new_artist);
		        });	    
		        
                tx.executeSql("INSERT OR IGNORE INTO songs_table(title, filepath, song_artist_id) VALUES (?, ?, (SELECT artist_id FROM artists_table WHERE artist_name = ?));",
			        [new_title, new_filepath, new_artist],
			        function() {
			        	console.log("added new song: " + new_title + new_filepath + new_artist);
			        },
			        function(err) {
			        	console.log(err);
			        	console.log("creating new song failed: "  + new_title + new_filepath + new_artist);
			        });    
		});
		
		

	},
	
	deleteEntry : function (fullpath) {
		console.log("delete entry called");
		if (Muzic.util.Database.getDatabase() === undefined) {
			Muzic.util.Database.openDB();
		}
		var myDb = Muzic.util.Database.getDatabase();
		
		myDb.transaction(function(tx) {
	        tx.executeSql("SELECT song_artist_id FROM songs_table WHERE filepath = ?;",
		        [fullpath],
		        function(tx, result) {
		        	console.log("Got artist_id: " + result);
		        	
		        	//Delete artist if not in use anymore
		       		tx.executeSql("DELETE FROM artists_table WHERE artist_id = ?;",
				        [result.rows.item(0).song_artist_id],
				        function() {
				        	console.log("Deleted artist: " + result.rows.item(0).song_artist_id);
				        },
				        function(err) {
				        	console.log(err);
				        	console.log("Deleting artist failed (still in use): " + result.rows.item(0).song_artist_id);
				        });
		        	
		        	//Delete entry from songs_table
		       		tx.executeSql("DELETE FROM songs_table WHERE filepath = ?;",
				        [fullpath],
				        function() {
				        	console.log("Deleted song: " + fullpath);
				        },
				        function(err) {
				        	console.log(err);
				        	console.log("Deleting song from songtable failed: " + fullpath);
				        });
		        },
		        function(err) {
		        	console.log(err);
		        	console.log("Deleting song failed, couldnt find artist: " + fullpath);
		        });
		});
	}


});