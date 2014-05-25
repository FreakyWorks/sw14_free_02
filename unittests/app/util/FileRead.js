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
	

	

});

