describe("Sencha", function () {

    it("has loaded itself", function () {
    	var i = file.requestOurFS();

        expect(i).toBe(0);
    });

});