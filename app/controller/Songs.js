Ext.define('Muzic.controller.Songs', {
	extend: 'Ext.app.Controller',

	config: {
		models: ['Song'],
		stores: ['Songs'],
		views:   ['Main'],
		
		userSelection : undefined,
		
		
		refs: {
			songList: '#mySongList',
			pauseButton: '#pauseButton',
			audioPlayer: 'audio'
		},
		
		control: {
			songList: {
				itemtap: 'onItemTap'
			},
			pauseButton: {
				tap: 'onPauseButtonTap'
			},
			audioPlayer: {
				ended: 'nextSong',
				stop: 'setPauseButtonToPlay',
				pause: 'setPauseButtonToPlay',
				play: 'setPauseButtonToPause'
			}
		}
	},
	

	
	onItemTap: function(self, index, target, record, e)
	{
		console.log(record);
		this.getAudioPlayer().updateUrl(record.data.filepath);
		this.setUserSelection(record);
		console.log(record.data.filepath);
		this.getAudioPlayer().play();
	},
	
	onPauseButtonTap: function(self, e)
	{
        //var container = self.getParent().getParent().getParent(),
        // use ComponentQuery to get the audio component (using its xtype)
        //audio = container.down('audio');
        console.log(this);
        if(this.getUserSelection() === undefined) {
        	filepath = Ext.getStore('Songs').first().getData().filepath;
        	console.log(filepath);
        	if(filepath !== undefined) {
        		this.setUserSelection(Ext.getStore('Songs').first());
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
		
	},
	
	toggleAudioPlayback : function (audioPlayer) {
		if(audioPlayer === undefined) {
			console.log("returned because player is undefined");
			return;
		}
		audioPlayer.toggle();
		this.getPauseButton().setText(audioPlayer.isPlaying() ? 'Pause' : 'Play');
		return audioPlayer.isPlaying();
	}
	
	/*toggleButonText : function () {
		var button = this.getPauseButton();
		if(button.getText() === 'Pause') {
			button.setText('Play');
		}
		else {
			button.setText('Pause');
		}
	}*/
	
});