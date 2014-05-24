Ext.require('Muzic.util.Database');


describe("Muzic.util.Database", function () {
	describe("Database loader", function () {
	
	
	    it("has loaded our database", function () {
	    	Muzic.util.Database.openDB();
	        expect(Muzic.util.Database.getDatabase()).toBeDefined();
	    });
	
	});
});

