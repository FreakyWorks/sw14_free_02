Ext.define('Muzic.controller.Songs', {
	extend: 'Ext.app.Controller',

	config: {
		models: ['Song'],
		views: ['Main'],
		
		refs: {
			songList: '#mySongList',
			pauseButton: '#pauseButton',
			audioPlayer: 'audio',
			playButtonInRow: '#playButton',
			searchField: '#search'
		},
		
		control: {
			songList: {
				itemtap: 'onItemTap',
				select: 'onItemSelect'
			},
			pauseButton: {
				tap: 'onPauseButtonTap'
			},
			audioPlayer: {
				ended: 'nextSong',
				//stop: 'setPauseButtonToPlay',
				//pause: 'setPauseButtonToPlay',
				//play: 'setPauseButtonToPause'
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
		var regex = new RegExp(self.getValue(), 'i');
		Ext.getStore('Songs').filter('title', regex);
	},
	
	unfilter: function(self, e, eOpts) {
		Ext.getStore('Songs').clearFilter();
	},

	/*store.on('load', function(store, records) {
	    if (records.length == 0) {
	        nestedList.getActiveItem().setHtml(nestedList.getEmptyText());
	    }
	}),*/

	
	onItemTap: function(self, index, target, record, e)
	{
		/*console.log(self);
		console.log(index);
		console.log(target);
		console.log(record);*/
		this.getAudioPlayer().updateUrl(record.data.filepath);
		Muzic.util.Player.setUserSelectedRecord(record);
		console.log(record.data.filepath);
		this.getAudioPlayer().play();
	},
	
	onItemSelect : function(self, record, eOpts) {
		console.log(record);
		var recordNumber = Muzic.util.Player.getUserSelectedRecord().id.replace( /^\D+/g, '');
		this.getAudioPlayer().updateUrl(record.data.filepath);
		Muzic.util.Player.setUserSelectedRecord(record);
		console.log(record.data.filepath);
		this.getAudioPlayer().play();
	},
	
	onPauseButtonTap: function(self, e)
	{
        //var container = self.getParent().getParent().getParent(),
        // use ComponentQuery to get the audio component (using its xtype)
        //audio = container.down('audio');
        //set first song if nothing has been tapped
        if(Muzic.util.Player.getUserSelectedRecord() === undefined) {
        	filepath = Ext.getStore('Songs').first().getData().filepath;
        	console.log(filepath);
        	if(filepath !== undefined) {
        		Muzic.util.Player.setUserSelectedRecord(Ext.getStore('Songs').first());
        		this.getAudioPlayer().updateUrl(filepath);
        	}
        }
        this.toggleAudioPlayback(this.getAudioPlayer());
	},
	
	setPauseButtonToPlay: function(self, time, eOpts)
	{
		//var button = Ext.getCmp('pauseButton');
		this.getPauseButton().setText('Play');
	},
	
	setPauseButtonToPause: function(self, time, eOpts)
	{
		this.getPauseButton().setText('Pause');
	},
	
	nextSong : function(self, time, eOpts) {
		console.log("next");
		var recordNumber = Muzic.util.Player.getIdOfUserSelectedRecord();
		console.log(recordNumber);
		if (recordNumber !== undefined) {
			var nextRecord = Muzic.util.Player.getUserSelectedRecord().stores[0].getById('ext-record-' + (recordNumber + 1));
    		console.log(nextRecord);
    		if (nextRecord !== undefined && nextRecord !== null) {
    			this.getSongList().select(nextRecord, false, false);
    		}
		}
	},
	
	toggleAudioPlayback : function (audioPlayer) {
		if(audioPlayer === undefined) {
			console.log("returned because player is undefined");
			return;
		}
		audioPlayer.toggle();
		return audioPlayer.isPlaying();
	}
	
});