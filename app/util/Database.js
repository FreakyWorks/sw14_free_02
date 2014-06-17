Ext.define('Muzic.util.Database', {

	singleton: true,
	autoDestroy: false,
	config : {
        database : undefined,
        store : undefined,
        createdTables: false
   },

	constructor : function(config) {
		this.initConfig(config);
		this.callParent([config]);
	},

	openDB : function () {
		if(!testUI) {
			Muzic.util.Database.setDatabase(window.sqlitePlugin.openDatabase({name: "MusicDatabase"}));
		}
		else {
			Muzic.util.Database.setDatabase(window.openDatabase("MusicDatabase", "1.0", "Music database", 10000000));
		}
	},
	
	createTables: function () {
		if (Muzic.util.Database.getCreatedTables()) {
			console.log('Already done');
			return;
		}
		if (Muzic.util.Database.getDatabase() === undefined) {
			Muzic.util.Database.openDB();
		}
		var myDb = Muzic.util.Database.getDatabase();
		myDb.transaction(function(tx) {
	        tx.executeSql('PRAGMA foreign_keys = ON;');
			tx.executeSql('CREATE TABLE IF NOT EXISTS artists_table(artist_id integer primary key, artist_name text unique);');
		    tx.executeSql('CREATE TABLE IF NOT EXISTS songs_table(song_id integer primary key, artist_id integer , title text, filepath text unique, FOREIGN KEY(artist_id) REFERENCES artists_table(artist_id), UNIQUE(artist_id, title, filepath));',
		    	[], function() {
		    		Muzic.util.Database.setCreatedTables(true);
			        window.setTimeout(function () {
			        	if (!testUI) {
			        		Muzic.util.Database.checkIfAllDBEntriesExist();
	        				Muzic.util.FileRead.addAllEntriesToDB(); //update DB
			        	}
	         		}, 300);	
	    	});
			//add table for album if id3 reader works
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
		        	//console.log("added new artist: " + new_artist);
	        	},
		        function(tx, err) {
		        	//console.log(err);
		        	//console.log(err.message);
		        	//console.log("creating new artist failed: " + new_artist);
		        });	    
		        
                tx.executeSql("INSERT OR IGNORE INTO songs_table(title, filepath, artist_id) VALUES (?, ?, (SELECT artist_id FROM artists_table WHERE artist_name = ?));",
			        [new_title, new_filepath, new_artist],
			        function() {
			        	//console.log("added new song: " + new_title + new_filepath + new_artist);
			        },
			        function(tx, err) {
			        	//console.log(err.message);
			        	//console.log("creating new song failed: "  + new_title + new_filepath + new_artist);
			        });    
		});
	},
	
	deleteEntry : function (fullpath) {
		console.log("delete entry called" + fullpath);
		if (Muzic.util.Database.getDatabase() === undefined) {
			Muzic.util.Database.openDB();
		}
		var myDb = Muzic.util.Database.getDatabase();
		
		myDb.transaction(function(tx) {
	        tx.executeSql("SELECT artist_id FROM songs_table WHERE filepath = ?;",
		        [fullpath],
		        function(tx, result) {
		        	console.log("Got artist_id: " + result);
		        	
		        	
		        	//Delete entry from songs_table
		       		tx.executeSql("DELETE FROM songs_table WHERE filepath = ?;",
				        [fullpath],
				        function() {
				        	//console.log("Deleted song: " + fullpath);
				        },
				        function(err) {
				        	//console.log(err);
				        	//console.log("Deleting song from songtable failed: " + fullpath);
				        });
		        	
		        	//Delete artist if not in use anymore
		       		tx.executeSql("DELETE FROM artists_table WHERE artist_id = ?;",
				        [result.rows.item(0).artist_id],
				        function() {
				        	//console.log("Deleted artist: " + result.rows.item(0).artist_id);
				        },
				        function(err) {
				        	//console.log(err);
				        	//console.log("Deleting artist failed (still in use): " + result.rows.item(0).artist_id);
				        });
		        	

		        },
		        function(err) {
		        	//console.log(err);
		        	//console.log("Deleting song failed, couldnt find artist: " + fullpath);
		        });
		});
	},
	
	checkIfAllDBEntriesExist : function () {
		var myDb = Muzic.util.Database.getDatabase();
    	myDb.transaction(function (tx) {
			tx.executeSql("SELECT filepath FROM songs_table;", [], function (tx, results) {
				console.log("Loaded filepaths");
				//console.log(results);
				rs = results;
				for (var counter = 0; counter < results.rows.length; counter++) {
					//console.log(results.rows.item(counter).filepath);
					Muzic.util.FileRead.checkIfFileExists(results.rows.item(counter).filepath, null, Muzic.util.Database.deleteEntry);
				}
			}, function() {
				console.log("Could not check entries");
			});
		});
	},
	
	addAllEntriesToStore : function (storeName, deleteExistingStore) {
		var store, fileObject, model;
		if ((store = Muzic.util.Database.requestStore(storeName)) === undefined) {
			console.log('store name does not exist');
			return;
		}
		if (Muzic.util.Database.getDatabase() === undefined) {
			Muzic.util.Database.openDB();
		}
		if (deleteExistingStore) {
			store.removeAll();
		}
		var myDb = Muzic.util.Database.getDatabase();
		
		myDb.transaction(function (tx) {
			tx.executeSql("SELECT title, artist_name, filepath FROM songs_table, artists_table WHERE songs_table.artist_id = artists_table.artist_id ORDER BY title;", [], function (tx, results) {
				console.log("Now adding all db entries to the store");
				var model_array = [];

				for(var counter = 0; counter < results.rows.length; counter++) {
					fileObject = Muzic.util.Database.createObject(results.rows.item(counter));
					//console.log(fileObject);
					if(fileObject !== undefined) {
						model = Muzic.util.Database.createModel(fileObject);
						//console.log(model);
						if(model !== undefined) {
							model_array.push(model);
						}
					}
				}
				Muzic.util.Database.addModelToStore(model_array, store);
			}, function(err) {
				console.log("Couldn't get songs.");
				console.log(err.message);
			});
		});
	},

	addAllEntriesToArtistStore : function (storeName, deleteExistingStore) {
		var store;
		var json_object_array = [];
		
		if ((store = Muzic.util.Database.requestStore(storeName)) === undefined) {
			console.log('store name does not exist');
			return;
		}
		if (Muzic.util.Database.getDatabase() === undefined) {
			Muzic.util.Database.openDB();
		}
		if (deleteExistingStore) {
			store.removeAll();
		}
		var myDb = Muzic.util.Database.getDatabase();
		
		myDb.transaction(function (tx) {
			tx.executeSql("SELECT * FROM artists_table;", [], function (tx, results) {
				var trying_to_read_length = results.rows.length;
				var read_length = 0;

				for(var counter = 0; counter < results.rows.length; counter++) {
					var artist_id = results.rows.item(counter).artist_id;
	
					tx.executeSql("SELECT title, artist_name, filepath FROM songs_table, artists_table WHERE songs_table.artist_id = ? AND songs_table.artist_id = artists_table.artist_id ORDER BY title;",
						[artist_id], function (tx, inner_results) {
							
						var json_object = {};
						
						json_object = {
							title: inner_results.rows.item(0).artist_name,
							filepath: '-',
							items: [],
							leaf: 'false'
						};
		
						for(var inner_counter = 0; inner_counter < inner_results.rows.length; inner_counter++) {
							//console.log(inner_results.rows.item(inner_counter));
							
							var fileObject = Muzic.util.Database.createObject(inner_results.rows.item(inner_counter));
							if(fileObject !== undefined) {
								json_object.items.push({
										title: fileObject.title,
										filepath: fileObject.filepath,
										artist: fileObject.artist,
										leaf:'true'
								});
							}
						}
						read_length++;
						if(json_object.items.length > 0) {
							json_object_array.push(json_object);
						}
						
						if(read_length === trying_to_read_length) {
							qerwter = json_object_array;
							//console.log(json_object_array);
							//console.log(JSON.stringify(json_object_array));
							console.log("Adding object to artists store");
							store.setData(json_object_array);
							store.sync();
						}
						
					}, function(ex, err) {
						console.log("Couldn't get songs.");
						read_length++;
						
						if(read_length === trying_to_read_length) {
							store.setData(json_object_array);
						}
						console.log(err);
					});
				}
			}, function(ex, err) {
				console.log("Couldn't get artist.");
				console.log(err);
			});
		});
		
		var progressIndicator = Ext.ComponentQuery.query('#progressIndicator');
		if (progressIndicator !== undefined && progressIndicator.length > 0) {
			progressIndicator[0].hide();
		}
	},

	createObject : function (db_item) {
		if (db_item === undefined) {
			console.log('db_item is undefined');
			return;
		}
		else {
			return { 
					title : db_item.title,
					artist: db_item.artist_name,
					filepath: db_item.filepath
		    };
		}
	},
	
	createModel : function (object) {
		if (object === undefined) {
			console.log("object is undefined");
			return;
		}
		var model = Ext.create('Muzic.model.Song', object);
		return model;
	},
	
	addModelToStore : function (model, store) {
		if ((model === undefined) || (store === undefined)) {
			console.log('returned undefined because model or store is undefined');
			return;
		}
		console.log("adding models");
		store.add(model);
	},
		
	requestStore : function (storeName) {
		if(storeName !== undefined && storeName !== null && storeName.length > 0) {
			var store = Ext.getStore(storeName);
			Muzic.util.Database.setStore(store);
			return store;
		}
		else {
			return undefined;
		}
	}
});