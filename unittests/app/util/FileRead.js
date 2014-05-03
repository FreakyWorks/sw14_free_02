Ext.require('Muzic.util.FileRead');


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
	    	//Muzic.util.FileRead.setFileSys(undefined);
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
	    	Muzic.util.FileRead.setDir(undefined);
		});
	});



	describe("Store", function () {
		var store;
		 beforeEach(function(done) {
		 	jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
		  	store = Muzic.util.FileRead.getStore('blablabla');
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
		 	jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
		  	store = Muzic.util.FileRead.getStore('Songs');
		  	console.log(store);
		    setTimeout(function() {
		      done();
		    }, 4000);
		});
		
		it("Songs has been loaded", function(done) {
			expect(store).toBeDefined();
			expect(store.getStoreId()).toBe('Songs');
			done();
		});
	});
	
	



});

