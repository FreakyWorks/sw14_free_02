Ext.define('Muzic.util.FileRead', {

	singleton: true,

	requestOurFS : function () {
		//console.log(getEventListener(document));
		console.log(window);
		console.log(1);
		window.requestFileSystem(LocalFileSystem.PERISTENT, 0, this.gotFileSystem, this.fail);
		console.log(window);
		return 0;
	},
	
	gotFileSystem : function (fileSystem) {
		console.log("gotFS");
		return true;
	},
	
	fail : function (message) {
		console.log('An error has occured in: ' + message);
		return message;
	}

});

//This is already listened to by Sencha!
//document.addEventListener('deviceready', file.requestOurFS() , false);