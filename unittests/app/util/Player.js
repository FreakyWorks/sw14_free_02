Ext.require('Muzic.util.Player');

describe("Muzic.util.Player", function () {
	describe("get ID of user selected record", function () {
		it("successfully returned our ID", function(done) {
			Muzic.util.Player.setUserSelectedRecord({id: 'ext-record-3'});
		    expect(Muzic.util.Player.getIdOfUserSelectedRecord()).toBeDefined();
		    expect(Muzic.util.Player.getIdOfUserSelectedRecord()).toBe(3);
			done();
		});
	});
});

