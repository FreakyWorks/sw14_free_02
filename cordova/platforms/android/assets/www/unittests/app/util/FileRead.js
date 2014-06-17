Ext.require('Muzic.util.FileRead');
Ext.require('Muzic.util.Database');

describe("Muzic.util.FileRead", function () {
	describe("Filesytem", function () {
		  beforeEach(function(done) {
		  	Muzic.util.FileRead.requestOurFS();
		    setTimeout(function() {
		      done();
		    }, 3000);
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
	});
	
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
		   jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
		   spyOn(Muzic.util.FileRead, 'fileExists');
		   var dirEntry = {nativeURL: 'testURL'};
		   Muzic.util.FileRead.checkIfFileExists(dirEntry.nativeURL);
		    setTimeout(function() {
		      //done();
		    }, 3000);
		});
		
		it("has been called", function() {
			expect(Muzic.util.FileRead.fileExists).not.toHaveBeenCalled();
		});
	});
	
	
	describe("Object Creator", function () {
		it("has returned our object", function() {
			var object = Muzic.util.FileRead.createObject(Muzic.util.FileRead.getDirEntries().length - 1);
			
			expect(object).toBeDefined();
			expect(object.filepath).toMatch('file:///storage/sdcard');
		});
	});
	
	describe("String trimmer", function () {
		it("has trimmed our string", function() {
			var trimmedStr = Muzic.util.FileRead.trimString("   My Artist - Title Name  ");
			expect(trimmedStr).toBe("My Artist - Title Name");
		});
	});
	
	describe("Title/Artist reader", function () {
		it("has read only the title", function() {
			var entry = {
				name : "My Title.mp3"
			};
			var titleArtist = Muzic.util.FileRead.getTitleArtistFromFileName(entry);
			console.log(titleArtist);
			expect(titleArtist.title).toBe("My Title");
			expect(titleArtist.artist).toBe('Unknown');
		});
		it("has read title and artist", function() {
			var entry = {
				name : "   My Artist - Title Name  .mp3"
			};
			var titleArtist = Muzic.util.FileRead.getTitleArtistFromFileName(entry);
			console.log(titleArtist);
			expect(titleArtist.title).toBe("Title Name");
			expect(titleArtist.artist).toBe("My Artist");
		});
		it("has read title and artist with long file ending", function() {
			var entry = {
				name : "My Artist - Title Name  .mp3.musicfile"
			};
			var titleArtist = Muzic.util.FileRead.getTitleArtistFromFileName(entry);
			console.log(titleArtist);
			expect(titleArtist.title).toBe("Title Name  .mp3");
			expect(titleArtist.artist).toBe("My Artist");
		});
		it("has read title and artist without fileending", function() {
			var entry = {
				name : "My Artist - Title Name  "
			};
			var titleArtist = Muzic.util.FileRead.getTitleArtistFromFileName(entry);
			console.log(titleArtist);
			expect(titleArtist.title).toBe("Title Name");
			expect(titleArtist.artist).toBe("My Artist");
		});
		it("has read title and artist wit multiple -", function() {
			var entry = {
				name : "My Artist - Title Name - g - something else   .mp3"
			};
			var titleArtist = Muzic.util.FileRead.getTitleArtistFromFileName(entry);
			console.log(titleArtist);
			expect(titleArtist.title).toBe("Title Name - g - something else");
			expect(titleArtist.artist).toBe("My Artist");
		});
	});
});

