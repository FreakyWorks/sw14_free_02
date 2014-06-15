Ext.define('Muzic.controller.Player', {
	extend: 'Ext.app.Controller',

	config: {
		//views:   ['Main', 'Player'],
		
		refs: {
			songList: '#mySongList',
			//pauseButton: '#pauseButton',
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
			
			/*,
			fastForwardButtonInRow: {
				ended: 'nextSong',
				stop: 'setPauseButtonToPlay',
				pause: 'setPauseButtonToPlay',
				play: 'setPauseButtonToPause'
			}*/
		}
	},
	
	onPlayStart: function (self, eOpts) {
		this.getPlayButtonInRow().setIconCls(this.getAudioPlayer().isPlaying() ? 'pause' : 'play');
	},
	
	onPlayButtonInRowTap: function(self, event) {
        //var container = self.getParent().getParent().getParent(),
        // use ComponentQuery to get the audio component (using its xtype)
        //audio = container.down('audio');
        
        console.log(this.getAbc());
        
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
	
	onFastForwardButtonInRowTap: function(self, event) {
		Muzic.util.Player.goToNextSong(this.getSongList());
	},
	
	onRewindButtonInRowTap: function(self, event) {
		Muzic.util.Player.goToPreviousSong(this.getSongList());
	},


	
	onItemTap: function(self, index, target, record, event)
	{
		this.getAudioPlayer().updateUrl(record.data.filepath);
		Muzic.util.Player.setUserSelectedRecord(record);
		console.log(record.data.filepath);
		this.toggleAudioPlayback().play();
	},
	
	onItemSelect : function(self, record, eOpts) {
		console.log(record);
		var recordNumber = Muzic.util.Player.getUserSelectedRecord().id.replace( /^\D+/g, '');
		this.getAudioPlayer().updateUrl(record.data.filepath);
		Muzic.util.Player.setUserSelectedRecord(record);
		console.log(record.data.filepath);
		this.getAudioPlayer().play();
	},
	
	/*onPauseButtonTap: function(self, event)
	{
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
	},*/
	
	setPauseButtonToPlay: function(self, time, eOpts)
	{
		this.getPauseButton().setText('Play');
	},
	
	setPauseButtonToPause: function(self, time, eOpts)
	{
		this.getPauseButton().setText('Pause');
	},
	
	toggleAudioPlayback : function (audioPlayer) {
		if(audioPlayer === undefined) {
			console.log("returned because player is undefined");
			return;
		}
		audioPlayer.toggle();
		//this.getPauseButton().setText(audioPlayer.isPlaying() ? 'Pause' : 'Play');
		this.getPlayButtonInRow().setIconCls(audioPlayer.isPlaying() ? 'pause' : 'play');
		
		return audioPlayer.isPlaying();
	}
});