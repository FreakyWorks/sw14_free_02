Ext.require('Muzic.util.Player');

describe("Muzic.util.Player", function () {
	describe("get ID of user selected record", function () {
		it("successfully returned our ID", function(done) {
			Muzic.util.Player.setUserSelectedRecord({id: 'ext-record-30'});
		    expect(Muzic.util.Player.getIdOfUserSelectedRecord()).toBeDefined();
		    expect(Muzic.util.Player.getIdOfUserSelectedRecord()).toBe(30);
			done();
		});
	});
	
	describe("next Song", function () {
		var rec, keep, suppress;
		
		
		var songList = {
			select : function(record, keepExisting, suppressEvent) {
				rec = record;
				keep = keepExisting;
				suppress = suppressEvent;
			}
		};
		it("called our select function with the right parameter", function(done) {
			Muzic.util.Player.setUserSelectedRecord({
				id: 'ext-record-30',
				stores: [
					{
						getById : function(id) {
							return 'ext-record-31';
						}
					}
				]
			});
			Muzic.util.Player.nextSong(songList);
			console.log(keep);
			console.log(suppress);
			console.log(rec);
			expect(keep).toBeFalsy();
			expect(suppress).toBeFalsy();
		    expect(rec).toBeDefined();
		    expect(parseInt(rec.replace( /^\D+/g, ''))).toBe(31);
			done();
		});
	});
});

