Ext.require('Muzic.view.Main');

describe("Main view", function () {
    it("has loaded our title card", function () {
        expect(Muzic.view.titles.Card).toBeDefined();
    });
});