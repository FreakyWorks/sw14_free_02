Ext.require('Muzic.util.FileRead');

describe("Cordova FileAPI", function () {
	  beforeEach(function(done) {
	  	Muzic.util.FileRead.requestOurFS();
	    setTimeout(function() {
	      done();
	    }, 3);
	  });
	  
	it("has got the file system", function(done) {
		var i = Muzic.util.FileRead.getFileSys();
		console.log(i);
		
	    expect(i).toBeDefined();
		done();
	});

});

