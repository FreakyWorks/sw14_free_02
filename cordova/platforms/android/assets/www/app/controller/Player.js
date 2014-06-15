Ext.define('Muzic.controller.Player', {
	extend: 'Ext.app.Controller',

	config: {
		//views:   ['Main', 'Player'],
		
		refs: {
			songList: '#mySongList',
			playButtonInRow: '#playButton',
			rewindButtonInRow: '#rewindButton',
			fastForwardButtonInRow: '#fastforwardButton',
			abc : '#tes',
			audioPlayer: 'audio'
		},
		
		control: {
			playButtonInRow: {
				tap: 'onPlayButtonInRowTap'
			},
			rewindButtonInRow: {
				tap: 'onRewindButtonInRowTap'
			},
			fastForwardButtonInRow: {
				tap: 'onFastForwardButtonInRowTap'
			},
			audioPlayer: {
				play: 'onPlayStart'
			}
		}
	},
	
	onPlayStart: function (self, eOpts) {
		this.getPlayButtonInRow().setIconCls(this.getAudioPlayer().isPlaying() ? 'pause' : 'play');
	},
	
	onPlayButtonInRowTap: function(self, event) {
        Muzic.util.Player.setCurrentList(this.getSongList());
        
        //set first song if nothing has been tapped
        if(Muzic.util.Player.getUserSelectedRecord() === undefined) {
        	filepath = Ext.getStore('Songs').first().getData().filepath;
        	console.log(filepath);
        	if(filepath !== undefined) {
        		Muzic.util.Player.setUserSelectedRecord(Ext.getStore('Songs').first());
        		this.getAudioPlayer().updateUrl(filepath);
				Muzic.util.Player.setPreviousButton(this.getRewindButtonInRow());
				Muzic.util.Player.setNextButton(this.getFastForwardButtonInRow());
        		Muzic.util.Player.checkButtons(0, this.getSongList());
        		this.getSongList().select(0, false, true);
        	}
        }
        this.toggleAudioPlayback(this.getAudioPlayer());
	},
	
	onFastForwardButtonInRowTap: function(self, event) {
		Muzic.util.Player.goToNextSong();
	},
	
	onRewindButtonInRowTap: function(self, event) {
		Muzic.util.Player.goToPreviousSong();
	},

	toggleAudioPlayback : function (audioPlayer) {
		if(audioPlayer === undefined) {
			console.log("returned because player is undefined");
			return;
		}
		audioPlayer.toggle();
		this.getPlayButtonInRow().setIconCls(audioPlayer.isPlaying() ? 'pause' : 'play');
		
		return audioPlayer.isPlaying();
	}
});