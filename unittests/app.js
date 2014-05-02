Ext.require('Muzic.view.Main');

describe("Sencha", function () {

	/*it("has destroyed app loader", function () {
        expect('appLoadingIndicator').toBeUndefined();
    });
*/
    it("has loaded itself", function () {
        expect(Ext).toBeDefined();
        expect(Ext.getVersion()).toBeTruthy();
        expect(Ext.getVersion().major).toBeGreaterThan(1);
    });
	
    it("has loaded our namespace", function () {
        expect(Muzic).toBeDefined();
    });
    
    	
    it("has loaded our main view", function () {
        expect(Muzic.view.Main).toBeDefined();
    });

    it("has loaded our titles view", function () {
    	var main = Ext.create(Muzic.view.Main);
        expect(Muzic.view.titles.Card).toBeDefined();
    });
});

describe("PhoneGap", function () {

    it("has been loaded", function () {
        expect(device.uuid).toBeGreaterThan(1);
        expect(Ext.browser.is.PhoneGap).toBeTruthy();
        
    });

});