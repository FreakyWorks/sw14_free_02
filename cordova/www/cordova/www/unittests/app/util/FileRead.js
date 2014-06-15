describe("Cordova FileAPI", function () {

    it("has got our FileSystem", function () {
    	var i = Muzic.util.FileRead.requestOurFS();

        expect(i).toBe(0);
    });

});