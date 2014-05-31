Ext.define('Muzic.controller.Songs', {
	extend: 'Ext.app.Controller',

	config: {
		models: ['Song'],
		stores: ['Songs'],
		views:   ['Main'],
		
		refs: {
			songList: 'list', //generic! change later to more specific
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
				ended: 'setPauseButtonToPlay',
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
		console.log(record.data.filepath);
		this.getAudioPlayer().play();
		//Muzic.util.FileRead.addAllEntriesToStore('Songs');
		//this.toggleAudioPlayback(this.getAudioPlayer());
	},
	
	onPauseButtonTap: function(self, e)
	{
        //var container = self.getParent().getParent().getParent(),
        // use ComponentQuery to get the audio component (using its xtype)
        //audio = container.down('audio');
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
	
	toggleAudioPlayback : function (audioPlayer) {
		if(audioPlayer === undefined) {
			console.log("returned because player is undefined");
			return;
		}
		audioPlayer.toggle();
		this.getPauseButton().setText(audioPlayer.isPlaying() ? 'Pause' : 'Play');
		return audioPlayer.isPlaying();
	},
	
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