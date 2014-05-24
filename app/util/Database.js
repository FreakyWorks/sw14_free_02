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
	}


});