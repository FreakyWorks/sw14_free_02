Ext.define('Muzic.controller.Songs', {
	extend: 'Ext.app.Controller',

	config: {
		models: ['Song'],
		views: ['Main'],
		
		refs: {
			songList: '#mySongList',
			audioPlayer: 'audio',
			playButtonInRow: '#playButton',
			rewindButtonInRow: '#rewindButton',
			fastForwardButtonInRow: '#fastforwardButton',
			searchField: '#search'
		},
		
		control: {
			songList: {
				itemtap: 'onItemTap',
				select: 'onItemSelect'
			},
			audioPlayer: {
				ended: 'nextSong'
			},
			searchField: {
				action: 'search',
				keyup: 'search',
				paste: 'search',
				clearicontap: 'unfilter'
			}
		}
	},

	search: function(self, e, eOpts) {
		// i : flag for case insensitive
		if (self.getValue().length == 0) {
			this.unfilter();
			return;
		}
		var regex = new RegExp(self.getValue(), 'i');
		Ext.getStore('Songs').filter('title', regex);
	},
	
	unfilter: function(self, e, eOpts) {
		this.getRewindButtonInRow().enable();
		this.getFastForwardButtonInRow().enable();
		Ext.getStore('Songs').clearFilter();
	},

	onItemTap: function(list, index, target, record, e)
	{
		Muzic.util.Player.setCurrentList(list);
		Muzic.util.Player.setCurrentSongIndex(index);
		Muzic.util.Player.setPreviousButton(this.getRewindButtonInRow());
		Muzic.util.Player.setNextButton(this.getFastForwardButtonInRow());
		Muzic.util.Player.checkButtons(index, list);
		
		this.getAudioPlayer().updateUrl(record.data.filepath);
		Muzic.util.Player.setUserSelectedRecord(record);
		this.getAudioPlayer().play();
	},
	
	onItemSelect : function(self, record, eOpts) {
		var recordNumber = Muzic.util.Player.getUserSelectedRecord().id.replace( /^\D+/g, '');
		this.getAudioPlayer().updateUrl(record.data.filepath);
		Muzic.util.Player.setUserSelectedRecord(record);
		this.getAudioPlayer().play();
	},
	
	nextSong : function(self, time, eOpts) {
		console.log("next");
		Muzic.util.Player.goToNextSong();
		this.getRewindButtonInRow().enable();
		this.getFastForwardButtonInRow().enable();
		/*var recordNumber = Muzic.util.Player.getIdOfUserSelectedRecord();
		console.log(recordNumber);
		if (recordNumber !== undefined) {
			var nextRecord = Muzic.util.Player.getUserSelectedRecord().stores[0].getById('ext-record-' + (recordNumber + 1));
    		console.log(nextRecord);
    		if (nextRecord !== undefined && nextRecord !== null) {
    			this.getSongList().select(nextRecord, false, false);
    		}
		}*/
	}
});