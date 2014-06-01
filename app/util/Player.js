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
	
	nextSong : function (songList) {
		console.log("next");
		var recordNumber = Muzic.util.Player.getIdOfUserSelectedRecord();
		console.log(recordNumber);
		if (recordNumber !== undefined) {
			var nextRecord = Muzic.util.Player.getUserSelectedRecord().stores[0].getById('ext-record-' + (recordNumber + 1));
    		console.log(nextRecord);
    		if (nextRecord !== undefined && nextRecord !== null && songList !== undefined) {
    			songList.select(nextRecord, false, false);
    		}
		}
	}
	
});