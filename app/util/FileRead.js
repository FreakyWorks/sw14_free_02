Ext.define('Muzic.util.FileRead', {

	singleton: true,
	autoDestroy: false,
	config : {
        fileSys : undefined,
        dir: [],
        dirEntries: [],
        store : undefined,
        recognizedEndings : ['mp3'],
        tryCounter: 0
   },
   
	constructor : function(config) {
		this.initConfig(config);
		this.callParent([config]);
	},

	//Request a file system
	requestOurFS : function () {
		if(Muzic.util.FileRead.getTryCounter() >= 10) {
			return;
		}
		if(LocalFileSystem === undefined) {
			setTimeout(function() { Muzic.util.FileRead.requestOurFS(); }, 250);
			Muzic.util.FileRead.setTryCounter(Muzic.util.FileRead.getTryCounter() + 1);
		}
		else {
			Muzic.util.FileRead.setTryCounter(0);
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, this.gotFileSystem, this.didntGetFileSystem);
		}
		
	},

	//Filesystem successfully requested
	gotFileSystem : function (fileSystem) {
		console.log("gotFS");
		Muzic.util.FileRead.setFileSys(fileSystem);
		//TEST:
		console.log(fileSystem.root);
	},
	
	
	//Request a directory, path should be relative to root
	requestDir : function (folder) {
		console.log("requestingDir: " + folder);
		var fileSystem = Muzic.util.FileRead.getFileSys();
		
		if(fileSystem == undefined) {
			if(Muzic.util.FileRead.getTryCounter() >= 10) {
				return;
			}
			Muzic.util.FileRead.requestOurFS();
			setTimeout(function() { Muzic.util.FileRead.requestDir(folder); }, 250);
			Muzic.util.FileRead.setTryCounter(Muzic.util.FileRead.getTryCounter() + 1);
		}
		else {
			fileSystem.root.getDirectory(folder, {create: false, exclusive: false}, this.gotDirectory, this.logErrorCode);
		}
		
	},
	
	//Directory successfully requested
	gotDirectory : function (directory) {
		console.log("gotDirectory");
		Muzic.util.FileRead.setDir(Muzic.util.FileRead.getDir().concat(directory));
		console.log(directory);
		//TODO may change
		Muzic.util.FileRead.requestEntries(Muzic.util.FileRead.getDir().length - 1);
	},
	
	
	//Request entries of directory
	requestEntries : function (directoryCounter) {
		var directory = Muzic.util.FileRead.getDir();
		if(directoryCounter >= directory.length || directory === undefined) {
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
	
	requestStore : function (storeName) {
		if(storeName !== undefined && storeName !== null && storeName.length > 0) {
			var store = Ext.getStore(storeName);
			Muzic.util.FileRead.setStore(store);
			return store;
		}
		else {
			return undefined;
		}
	},
	
	checkEnding : function (fileName) {
		if(fileName === undefined) {
			return;
		}
		var currentEnding;
		var begin, end;
		var endings = Muzic.util.FileRead.getRecognizedEndings();
		
		for (var counter = 0; counter < endings.length; counter++) {
			currentEnding = endings[counter];
			begin = fileName.length - currentEnding.length;
			end = fileName.length - 1;
			console.log(fileName.substr(begin, end));
			
			if(fileName.substr(begin, end) === currentEnding) {
				return true;
			}
		}
		return false;
	},
	
	createObject : function (entryCounter) {
		if (entryCounter >= Muzic.util.FileRead.getDirEntries().length) {
			console.log('wrong length');
			return;
		}
		else {
			if(!(Muzic.util.FileRead.checkEnding(Muzic.util.FileRead.getDirEntries()[entryCounter].name))) {
				console.log('wrong ending');
				return;
			}
			return { 
					title : Muzic.util.FileRead.getDirEntries()[entryCounter].nativeURL,
					filepath : Muzic.util.FileRead.getDirEntries()[entryCounter].nativeURL
				};
		}
	},
	
	createModel : function (object) {
		if (object === undefined) {
			return;
		}
		var model = Ext.create('Muzic.model.Song', object);
		return model;
	},
	
	addModelToStore : function (model, store) {
		console.log("er");
		if ((model === undefined) || (store === undefined)) {
			console.log('returned undefined because model or store is undefined');
			return;
		}
		console.log("adding" + model);
		store.add(model);
	},
	
	addAllEntriesToStore : function (storeName) {
		var store, fileObject, model;
		if ((store = Muzic.util.FileRead.requestStore(storeName)) === undefined) {
			console.log('store name does not exist');
			return;
		}
		for(var counter = 0; counter < Muzic.util.FileRead.getDirEntries().length; counter++) {
			fileObject = Muzic.util.FileRead.createObject(counter);
			if(fileObject !== undefined) {
				model = Muzic.util.FileRead.createModel(fileObject);
				console.log(model);
				if(model !== undefined) {
					Muzic.util.FileRead.addModelToStore(model, store);
				}
			}
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