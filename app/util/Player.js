Ext.define('Muzic.util.Player', {

	singleton: true,
	autoDestroy: false,
	config : {
        userSelectedRecord : undefined
   },

	constructor : function(config) {
		this.initConfig(config);
		this.callParent([config]);
	},
	
	getIdOfUserSelectedRecord : function () {
		if (Muzic.util.Player.getUserSelectedRecord() !== undefined) {
			console.log(Muzic.util.Player.getUserSelectedRecord());
			return parseInt(Muzic.util.Player.getUserSelectedRecord().id.replace( /^\D+/g, ''));
		}
		return undefined;
	},
	
	goToNextSong : function (songList) {
		console.log("next");
		Muzic.util.Player.changeSong(songList, 1);
	},
	
	goToPreviousSong : function (songList) {
		console.log("previous");
		Muzic.util.Player.changeSong(songList, -1);
	},
	
	changeSong : function (songList, offset) {
		var recordNumber = Muzic.util.Player.getIdOfUserSelectedRecord();
		console.log(recordNumber);
		if (recordNumber !== undefined && offset !== undefined) {
			var nextRecord = Muzic.util.Player.getUserSelectedRecord().stores[0].getById('ext-record-' + (recordNumber + offset));
    		console.log(nextRecord);
    		if (nextRecord !== undefined && nextRecord !== null && songList !== undefined) {
    			songList.select(nextRecord, false, false);
    		}
		}
	}
});