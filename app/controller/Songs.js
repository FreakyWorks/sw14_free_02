Ext.define('Muzic.controller.Songs', {
	extend: 'Ext.app.Controller',

	config: {
		models: ['Song'],
		stores: ['Songs'],
		
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
				ended: 'onPlayEnded'
			}
		}
	},
	
	onItemTap: function(self, index, target, record, e)
	{
		console.log("da");
	},
	
	onPauseButtonTap: function(self, e)
	{
        var container = self.getParent().getParent().getParent(),
        // use ComponentQuery to get the audio component (using its xtype)
        audio = container.down('audio');

        audio.toggle();
        self.setText(audio.isPlaying() ? 'Pause' : 'Play');
		//Pause music
	},
	
	onPlayEnded: function(self, time, eOpts)
	{
		var button = Ext.getCmp('pauseButton');
		button.setText('Play');
	}

	
});