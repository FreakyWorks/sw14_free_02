Ext.define('Muzic.util.FileRead', {

	singleton: true,
	autoDestroy: false,
	config : {
        fileSys : undefined,
        dir: [],
        dirEntries: []
   },
   
	constructor : function(config) {
		this.initConfig(config);
		this.callParent([config]);
	},

	//Request a file system
	requestOurFS : function () {
		//console.log(getEventListener(document));
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, this.gotFileSystem, this.didntGetFileSystem);
		
	},

	//Filesystem successfully requested
	gotFileSystem : function (fileSystem) {
		console.log("gotFS");
		Muzic.util.FileRead.setFileSys(fileSystem);
		//TEST:
		console.log(fileSystem.root);
		/*var dirReader = fileSystem.root.createReader();
		console.log("hier");
		dirReader.readEntries(this.readEntries, this.fail);*/
	},
	
	//Request a directory, path should be relative to root
	requestDir : function (folder) {
		console.log("requestingDir: " + folder);
		var fileSystem = Muzic.util.FileRead.getFileSys();
		fileSystem.root.getDirectory(folder, {create: false, exclusive: false}, this.gotDirectory, this.logErrorCode);
	},
	
	//Muzic.util.FileRead.getFileSys().root.createReader().readEntries(Muzic.util.FileRead.gotDirectory, Muzic.util.FileRead.fail);
	
	//Directory successfully requested
	gotDirectory : function (directory) {
		console.log("gotDir");
		Muzic.util.FileRead.setDir(Muzic.util.FileRead.getDir().concat(directory));
		console.log(directory);
		
	},
	
	//Request entries of directory
	requestEntries : function (directoryCounter) {
		var directory = Muzic.util.FileRead.getDir();
		if(directoryCounter >= directory.length) {
			return;
		}
		var directoryReader = directory[directoryCounter].createReader();
		directoryReader.readEntries(this.gotEntries, this.logErrorCode);
	},
	
	//Entries successfully requested
	gotEntries : function (entries) {
		//Muzic.util.FileRead.setEntries(entries);
		console.log('got entries');
		console.log(entries);
		Muzic.util.FileRead.setDirEntries(Muzic.util.FileRead.getDirEntries().concat(entries));
	},
	
	getStore : function (storeName) {
		if(storeName !== undefined && storeName !== null && storeName.length > 0) {
			return Ext.getStore(storeName);
		}
		else {
			return undefined;
		}
	},
	
	createObject : function (entryCounter) {
		if (entryCounter >= Muzic.util.FileRead.getDirEntries().length) {
			return;
		}
		else {
			return { filepath : this.getDirEntries()[entryCounter].nativeURL };
		}
	},
	

	
	//Our error handlers
	didntGetFileSystem : function (err) {
		//TODO show fail to user
		console.log('An error has occured: ' + err.target.error.code);
	},
	logErrorCode : function (err) {
		console.log('An error has occured: ' + err.code + ' - See https://developer.mozilla.org/en-US/docs/Web/API/FileError');
	}
});