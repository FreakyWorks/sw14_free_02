Ext.define('Muzic.controller.Songs', {
	extend: 'Ext.app.Controller',

	config: {
		models: ['Song'],
		stores: ['Songs'],
		
		refs: {
			songList: 'list', //generic! change later to more specific
			pauseButton: '#pauseButton'
		},
		
		control: {
			songList: {
				itemtap: 'onItemTap'
			},
			pauseButton: {
				tap: 'onPauseButtonTap'
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
	}

	/*getFullName: function() {
		return this.get('first_name') + ' ' + this.get('last_name');
	}*/
});