Ext.define('Muzic.controller.Artists', {
	extend: 'Ext.app.Controller',

	config: {
		//views: ['albums.Card'],
		
		refs: {
			artistsList: '#artistsNL',
			audioPlayer: 'audio'
		},
		
		control: {
			artistsList: {
				leafitemtap: 'onLeafItemTap'
			}
		}
	},
	
	onLeafItemTap : function(self, list, index, target, record, e, eOpts) {
		console.log("start");
		console.log(self);
		console.log(list);
		console.log(index);
		console.log(target);
		console.log(record);
		//var recordNumber = Muzic.util.Player.getUserSelectedRecord().id.replace( /^\D+/g, '');
		Muzic.util.Player.setUserSelectedRecord(record);
		this.getAudioPlayer().updateUrl(record.data.filepath);
		Muzic.util.Player.setUserSelectedRecord(record);
		console.log(record.data.filepath);
		this.getAudioPlayer().play();
		
	}
});