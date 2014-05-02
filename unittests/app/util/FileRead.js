Ext.require('Muzic.util.FileRead');

describe("Cordova FileAPI", function () {
	  beforeEach(function(done) {
	  	Muzic.util.FileRead.requestOurFS();
	    setTimeout(function() {
	      done();
	    }, 3);
	  });
	  
	it("has got the file system", function(done) {
	    expect(Muzic.util.FileRead.getFileSys()).toBeDefined();
		done();
	});
	
	afterEach(function () {
    	//Muzic.util.FileRead.setFileSys(undefined);
	});
});

describe("Directory Reader", function () {
	 beforeEach(function(done) {
	  	Muzic.util.FileRead.requestDir('Music');
	    setTimeout(function() {
	      done();
	    }, 3);
	});
	  
	it("has gotten our directory", function(done) {
		var dir = Muzic.util.FileRead.getDir();
		console.log(dir);
	    expect(dir).toBeDefined();
	    expect(Muzic.util.FileRead.getDir().name).toBe('Music');
		done();
	});
	
	afterEach(function () {
    	Muzic.util.FileRead.setDir(undefined);
	});
});