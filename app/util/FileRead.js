Ext.define('Muzic.util.FileRead', {

	singleton: true,
	autoDestroy: false,
	config : {
        fileSys : undefined
   },

	requestOurFS : function () {
		//console.log(getEventListener(document));
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, this.gotFileSystem, this.fail);
		
	},
	constructor : function(config) {
		this.initConfig(config);
		this.callParent([config]);
	},
	
	gotFileSystem : function (fileSystem) {
		console.log("gotFS");
		Muzic.util.FileRead.setFileSys(fileSystem);
		
	},
	

	
	
	//Our error handler
	fail : function (message) {
		//TODO show fail to user
		console.log('An error has occured in: ' + message);
	}
});

//This is already listened to by Sencha!
//document.addEventListener('deviceready', file.requestOurFS() , false);