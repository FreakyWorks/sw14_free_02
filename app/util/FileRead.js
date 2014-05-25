Ext.define('Muzic.util.FileRead', {

	singleton: true,
	autoDestroy: false,
    requires: [
    	'Muzic.util.Database'
    ],
   
	config : {
        fileSys : undefined,
        dir: [],
        dirEntries: [],
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
	
	addAllEntriesToDB : function () {
		var fileObject = undefined;
		for(var counter = 0; counter < Muzic.util.FileRead.getDirEntries().length; counter++) {
			fileObject = Muzic.util.FileRead.createObject(counter);
			if(fileObject !== undefined) {
				Muzic.util.Database.addEntry((fileObject.title || ""), (fileObject.artist || ""), (fileObject.filepath || ""));
			}
		}
	},
	
	checkIfFileExists : function (nativeURL, fileExistsCallback, fileDoesntExistCallback) {
		console.log("checking if file exists");
		window.resolveLocalFileSystemURL(nativeURL,
			fileExistsCallback, fileDoesntExistCallback(nativeURL));
	},
	
	fileExists : function(fileEntry) {
		console.log("FileExists");
		console.log(fileEntry);
	},
	
	fileDoesntExist : function(nativeURL) {
		console.log("FileDOESTNExists");
		console.log(nativeURL);
	},
	
	
	loadID3Tag : function (fileEntry) {
		
		/*ID3.loadTags("http://media.aaspeakers.org/download.php?file_id=b04b8a3e62f81a615317b00f5abaec2d&save=Dr.%20Harry%20T.%20from%20New%20York%20-%20Anonymity%20The%20Ego%20Reducer%20in%20St.%20Louis%2C%20MO%20on%20%2807-05-1955%29.mp3", function() {
		    var tags = ID3.getAllTags("http://media.aaspeakers.org/download.php?file_id=b04b8a3e62f81a615317b00f5abaec2d&save=Dr.%20Harry%20T.%20from%20New%20York%20-%20Anonymity%20The%20Ego%20Reducer%20in%20St.%20Louis%2C%20MO%20on%20%2807-05-1955%29.mp3");
		    console.log(tags.artist + " - " + tags.title + ", " + tags.album);
		},
		{
		onError: function(reason) {
			console.log(reason);
       }
    });*/
   		fileEntry.file(Muzic.util.FileRead.gotID3File, Muzic.util.FileRead.errorID3);

	},
	
	gotID3File : function (file) {
		console.log(file);
		console.log("loading tags?");
		setTimeout(function () {
		ID3.loadTags(file.localURL, function() {
			console.log("loaded tags!");
		    var tags = ID3.getAllTags(file.localURL);
		    console.log(tags);
		    console.log(tags.comment + " - " + tags.track + ", " + tags.lyrics);
		    ID3.clearAll();
		}, {
		    dataReader: FileAPIReader(file)
		});
	}, 1000);

	},
	
	errorID3 : function (error) {
		console.log("Unable to retrieve file properties: " + error.code);
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
			//Muzic.util.FileRead.loadID3Tag(Muzic.util.FileRead.getDirEntries()[entryCounter]);
			return { 
					title : Muzic.util.FileRead.getDirEntries()[entryCounter].nativeURL,
					artist: Muzic.util.FileRead.getDirEntries()[entryCounter].nativeURL,
					filepath : Muzic.util.FileRead.getDirEntries()[entryCounter].nativeURL
		    };
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