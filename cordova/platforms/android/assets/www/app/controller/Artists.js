Ext.define('Muzic.controller.Artists', {
	extend: 'Ext.app.Controller',

	config: {
		//views: ['albums.Card'],
		
		refs: {
			artistsList: '#artistsNL',
			audioPlayer: 'audio',
			rewindButtonInRow: '#rewindButton',
			fastForwardButtonInRow: '#fastforwardButton'
		},
		
		control: {
			artistsList: {
				leafitemtap: 'onLeafItemTap',
				selectionchange: 'onSelectionChange'
			}
		}
	},
	
	onLeafItemTap : function(self, list, index, target, record, e, eOpts) {
		Muzic.util.Player.setCurrentList(list);
		Muzic.util.Player.setCurrentSongIndex(index);
		
		Muzic.util.Player.setPreviousButton(this.getRewindButtonInRow());
		Muzic.util.Player.setNextButton(this.getFastForwardButtonInRow());
		Muzic.util.Player.checkButtons(index, list);
		
		Muzic.util.Player.setUserSelectedRecord(record);
		this.getAudioPlayer().updateUrl(record.data.filepath);
		Muzic.util.Player.setUserSelectedRecord(record);
		this.getAudioPlayer().play();
	},
	
	onSelectionChange : function(self, list, record, eOpts) {
		//console.log(record);
		//console.log(eOpts);
		if (record.length === 1 && record[0].data !== undefined && record[0].data.leaf) {
			Muzic.util.Player.setCurrentList(list);
			Muzic.util.Player.setUserSelectedRecord(record[0]);
			this.getAudioPlayer().updateUrl(record[0].data.filepath);
			Muzic.util.Player.setUserSelectedRecord(record[0]);
			console.log(record[0].data.filepath);
			this.getAudioPlayer().play();
		}
	}
});