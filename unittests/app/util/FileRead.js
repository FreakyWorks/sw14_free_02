Ext.require('Muzic.util.FileRead');



describe("Filesytem", function () {
	  beforeEach(function(done) {
	  	Muzic.util.FileRead.requestOurFS();
	    setTimeout(function() {
	      done();
	    }, 2000);
	  });
	  
	it("successfully requested", function(done) {
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
	  
	it("has gotten our music directory", function(done) {
		var dir = Muzic.util.FileRead.getDir();
		console.log(dir);
	    expect(dir).toBeDefined();
	    expect(Muzic.util.FileRead.getDir().name).toBe('Music');
		done();
	});
	
	afterEach(function () {
    	//Muzic.util.FileRead.setDir(undefined);
	});
});


describe("Directory Reader", function () {
	 beforeEach(function(done) {
	  	Muzic.util.FileRead.requestEntries();
	    setTimeout(function() {
	      done();
	    }, 2000);
	});
	  
	it("has gotten the entries of our Music directory", function(done) {
		var dirEntries = Muzic.util.FileRead.getDirEntries();
		console.log(dirEntries);
	    expect(dirEntries).toBeDefined();
	    expect(dirEntries).toContain(jasmine.objectContaining({
      		isFile: true
    	}));
		done();
	});
	
	afterEach(function () {
    	Muzic.util.FileRead.setDir(undefined);
	});
});