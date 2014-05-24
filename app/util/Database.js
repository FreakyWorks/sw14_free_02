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
		if (Muzic.util.Database.getDatabase() == undefined) {
			Muzic.util.Database.openDB();
		}
		myDb = Muzic.util.Database.getDatabase();
		myDb.transaction(function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS songs_table (song_id integer primary key, title text, filepath text)');
		//TODO add table for artist, album if id3 reader works
      });
	},
	
	addEntry: function (new_title, new_filepath) {
		if (Muzic.util.Database.getDatabase() == undefined) {
			Muzic.util.Database.openDB();
		}
		myDb = Muzic.util.Database.getDatabase();
		myDb.transaction(function(tx) {
        
        tx.executeSql("INSERT INTO songs_table(title, filepath) VALUES (?, ?)",
	        [new_title, new_filepath],
	        function(){ /* SUCCESS */},
	        function(){ /* FAIL */});
      });
	}


});