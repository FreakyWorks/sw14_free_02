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
	
	describe("go to next Song", function () {
		var rec, keep, suppress;
		
		
		var songList = {
			select : function(record, keepExisting, suppressEvent) {
				rec = record;
				keep = keepExisting;
				suppress = suppressEvent;
			}
		};
		it("called our select function with the right parameter", function(done) {
			Muzic.util.Player.setCurrentList(songList);
			Muzic.util.Player.setCurrentSongIndex(0);
			Muzic.util.Player.goToNextSong();
			expect(Muzic.util.Player.getCurrentSongIndex()).toBe(1);
			expect(keep).toBeFalsy();
			expect(suppress).toBeFalsy();
		    expect(rec).toBeDefined();
		    expect(rec).toBe(1);
			done();
		});
	});
	
	describe("go to previous Song", function () {
		var rec, keep, suppress;
		
		
		var songList = {
			select : function(record, keepExisting, suppressEvent) {
				rec = record;
				keep = keepExisting;
				suppress = suppressEvent;
			}
		};
		it("called our select function with the right parameter", function(done) {
			Muzic.util.Player.setCurrentList(songList);
			Muzic.util.Player.setCurrentSongIndex(1);
			Muzic.util.Player.goToPreviousSong();
			expect(Muzic.util.Player.getCurrentSongIndex()).toBe(0);
			expect(keep).toBeFalsy();
			expect(suppress).toBeFalsy();
		    expect(rec).toBeDefined();
		    expect(rec).toBe(0);
			done();
		});
	});
});

