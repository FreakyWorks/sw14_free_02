Ext.define('Muzic.util.Player', {

	singleton: true,
	autoDestroy: false,
	
	config : {
        userSelectedRecord : undefined,
		currentList: undefined,
		currentSongIndex: 0,
		previousButton: undefined,
		nextButton: undefined
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
	
	goToNextSong : function () {
		console.log("next");
		var song_index = Muzic.util.Player.getCurrentSongIndex() + 1;
		if (Muzic.util.Player.getPreviousButton() !== undefined) {
			Muzic.util.Player.getPreviousButton().enable();
		}
		Muzic.util.Player.setCurrentSongIndex(song_index);
		Muzic.util.Player.getCurrentList().select(song_index);
		
		if (Muzic.util.Player.getNextButton() !== undefined && song_index >= (Muzic.util.Player.getCurrentList().getStore().getCount() - 1)) {
			Muzic.util.Player.getNextButton().disable();
		}
	},
	
	goToPreviousSong : function () {
		console.log("previous");
		var song_index = Muzic.util.Player.getCurrentSongIndex() - 1;
		Muzic.util.Player.setCurrentSongIndex(song_index);
		Muzic.util.Player.getCurrentList().select(song_index);
		
		if (Muzic.util.Player.getPreviousButton() !== undefined) {
			if (song_index <= 0) {
				Muzic.util.Player.getPreviousButton().disable();
			}
			else {
				Muzic.util.Player.getPreviousButton().enable();
			}
		}
		if (Muzic.util.Player.getNextButton() !== undefined && song_index < (Muzic.util.Player.getCurrentList().getStore().getCount() - 1)) {
			Muzic.util.Player.getNextButton().enable();
		}
	},
	
	checkButtons : function(index, list) {
		if (index > 0) {
			Muzic.util.Player.getPreviousButton().enable();
		}
		else {
			Muzic.util.Player.getPreviousButton().disable();
		}
		
		if (index < (list.getStore().getCount() - 1)) {
			Muzic.util.Player.getNextButton().enable();
		}
		else {
			Muzic.util.Player.getNextButton().disable();
		}
	}
});