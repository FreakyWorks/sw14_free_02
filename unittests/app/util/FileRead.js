Ext.require('Muzic.util.FileRead');
Ext.require('Muzic.util.Database');

describe("Muzic.util.FileRead", function () {
	describe("Filesytem", function () {
		  beforeEach(function(done) {
		  	Muzic.util.FileRead.requestOurFS();
		    setTimeout(function() {
		      done();
		    }, 2000);
		  });
		  
		it("successfully requested in under 2s", function(done) {
		    expect(Muzic.util.FileRead.getFileSys()).toBeDefined();
			done();
		});
		
		afterEach(function () {
	    	Muzic.util.FileRead.setFileSys(undefined);
		});
	});
	
	describe("Get Directory", function () {
		 beforeEach(function(done) {
		  	Muzic.util.FileRead.requestDir('Music');
		    setTimeout(function() {
		      done();
		    }, 2000);
		});
		  
		it("has gotten our music directory in under 2s", function(done) {
			var dir = Muzic.util.FileRead.getDir();
			console.log(dir);
		    expect(dir).toBeDefined();
		    expect(Muzic.util.FileRead.getDir()[0].name).toBe('Music');
			done();
		});
		
		afterEach(function () {
	    	//Muzic.util.FileRead.setDir(undefined);
		});
	});
	
	//TODO try to merge it now
	describe("Directory Reader", function () {
		 beforeEach(function(done) {
		  	Muzic.util.FileRead.requestEntries(Muzic.util.FileRead.getDir().length - 1);
		    setTimeout(function() {
		      done();
		    }, 2000);
		});
		  
		it("has gotten the entries of our Music directory in under 2s", function(done) {
			var dirEntries = Muzic.util.FileRead.getDirEntries();
			console.log(dirEntries);
		    expect(dirEntries).toBeDefined();
		    expect(dirEntries.length).toBeGreaterThan(0);
		    expect(dirEntries[dirEntries.length - 1]).toBeDefined();
		    expect(dirEntries).toContain(jasmine.objectContaining({
	      		isFile: true
	    	}));
			done();
		});
		
		afterEach(function () {
	    	Muzic.util.FileRead.setDir([]);
		});
	});



	describe("Store", function () {
		var store;
		 beforeEach(function(done) {
		 	jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
		  	store = Muzic.util.FileRead.requestStore('blablabla');
		  	console.log(store);
		    setTimeout(function() {
		      done();
		    }, 4000);
		});
		
		it("should not load", function(done) {
			expect(store).toBeUndefined();
			done();
		});
	});
	describe("Store", function () {
		var store;
		 beforeEach(function(done) {
		 	jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
		  	store = Muzic.util.FileRead.requestStore('Songs');
		  	console.log(store);
		    setTimeout(function() {
		      done();
		    }, 4000);
		});
		
		it("Songs has been loaded and saved", function(done) {
			console.log(store);
			expect(store).toBeDefined();
			expect(store.getStoreId()).toBe('Songs');
			var savedStore = Muzic.util.FileRead.getStore();
			expect(savedStore).toBeDefined();
			expect(savedStore.getStoreId()).toBe('Songs');
			done();
		});
	});
	
	describe("Endings checker", function () {
		it("should return undefined", function() {
			expect(Muzic.util.FileRead.checkEnding(undefined)).toBeUndefined();
			
		});
		it("should return recognized ending", function() {
			var recognizedEndings = Muzic.util.FileRead.getRecognizedEndings();
			for(var counter = 0; counter < recognizedEndings.length; counter++) {
				var ourFilename = 'some name' + recognizedEndings[counter];
				var endingSupported = Muzic.util.FileRead.checkEnding(ourFilename);
				expect(endingSupported).toBeTruthy();
			}
		});
		it("should NOT return recognized ending", function() {
			var recognizedEndings = Muzic.util.FileRead.getRecognizedEndings();
			for(var counter = 0; counter < recognizedEndings.length; counter++) {
				var ourFilename = 'some name' + recognizedEndings[counter] + '.weird';
				var endingSupported = Muzic.util.FileRead.checkEnding(ourFilename);
				expect(endingSupported).toBeFalsy();
			}
		});
	});
	
	
	
	describe("File exists checker", function () {
		beforeEach(function() {
		   spyOn(Muzic.util.Database, 'deleteEntry');
		   var dirEntries = Muzic.util.FileRead.getDirEntries();
		   Muzic.util.FileRead.checkIfFileExists(dirEntries[dirEntries.length - 1].nativeURL, undefined, Muzic.util.Database.deleteEntry);
		   Muzic.util.FileRead.checkIfFileExists("file://fake/Path", undefined, Muzic.util.Database.deleteEntry);
		    setTimeout(function() {
		      done();
		    }, 2000);
		});
		
		it("has called deleter (our callback)", function() {
			expect(Muzic.util.Database.deleteEntry).toHaveBeenCalled();
		});
	});
	
	
	describe("Object Creator", function () {
		it("has returned our object", function() {
			var object = Muzic.util.FileRead.createObject(Muzic.util.FileRead.getDirEntries().length - 1);
			
			expect(object).toBeDefined();
			expect(object.filepath).toMatch('file:///storage/sdcard/Music/');
		});
	});
	
	describe("Model Creator", function () {
		it("has returned our model", function() {
			var model = Muzic.util.FileRead.createModel( { filepath : 'samplepath' } );
			
			expect(model).toBeDefined();
			console.log(model);
			expect(model.data.filepath).toMatch('samplepath');
		});
	});

	describe("Model to store adder", function () {
		var store;
		beforeEach(function(done) {
			console.log("before");
			jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
		  	store = Muzic.util.FileRead.requestStore('Songs');
		  	console.log(store);
		    setTimeout(function() {
		      done();
		    }, 3000);
		});
		it("has stored our model to the store", function() {
			Muzic.util.FileRead.addModelToStore(Muzic.util.FileRead.createModel( { filepath : 'samplepath' } ), store);
			console.log(store.data.all);
			var data = store.data.all;
			expect(data).toBeDefined();
			var lastItem = data[data.length - 1].data;
			expect(lastItem).toBeDefined();
			expect(lastItem.filepath).toMatch('samplepath');
			//done();
		});
		it("should fail but keep existing data intact", function() {
			Muzic.util.FileRead.addModelToStore(undefined, store);
			var data = store.data.all;
			var lastItem = data[data.length - 1].data;
			expect(lastItem.filepath).toMatch('samplepath');
			//done();
		});
	});
	
	
	describe("Entry to store adder", function () {
		var store;
		beforeEach(function(done) {
			console.log("before");
			jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
		  	store = Muzic.util.FileRead.requestStore('Songs');
		  	console.log(store);
		    setTimeout(function() {
		      done();
		    }, 3000);
		});
		it("has stored our model to the store", function() {
			Muzic.util.FileRead.addModelToStore(Muzic.util.FileRead.createModel( { filepath : 'samplepath' } ), store);
			console.log(store.data.all);
			var data = store.data.all;
			expect(data).toBeDefined();
			var lastItem = data[data.length - 1].data;
			expect(lastItem).toBeDefined();
			expect(lastItem.filepath).toMatch('samplepath');
			//done();
		});
		it("should fail but keep existing data intact", function() {
			Muzic.util.FileRead.addModelToStore(undefined, store);
			var data = store.data.all;
			var lastItem = data[data.length - 1].data;
			expect(lastItem.filepath).toMatch('samplepath');
			//done();
		});
	});
	
	
	describe("addAllEntriesToStore", function () {
		beforeEach(function(done) {
			console.log("before");
			jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
		  	Muzic.util.FileRead.requestDir('Music');
		    setTimeout(function() {
		      done();
		    }, 3000);
		});
		it("has stored all entries to the store", function() {
			console.log("hier");
			Muzic.util.FileRead.addAllEntriesToStore('Songs');
			var data = Muzic.util.FileRead.getStore().data.all;
			var previousItem = data[data.length - 2].data;
			var lastItem = data[data.length - 1].data;
			//Expecting that folder contains both crash.mp3 and crash1.mp3
			expect(previousItem.filepath).toMatch('link.mp3');
			//expect(lastItem.filepath).toMatch('crash1.mp3'); //TODO change to search through all files
			//done();
		});
	});
	

});

