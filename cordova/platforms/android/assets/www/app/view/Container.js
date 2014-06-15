Ext.define('Muzic.view.Container', {

    extend: 'Ext.Panel',

    config: {

        title: 'Playing',
        iconCls: 'play',
        layout: {
        	type: 'vbox',
        	pack: 'end'
        },

        autoDestroy: false,
        items: [
	        {
		        layout: {
		        	type: 'hbox',
		        	pack: 'end'
		        },
		        defaults: {
		        	flex : 10
		        },
		        items: [
			        {
			            xtype : 'audio',
			            id : 'audioPlayer',
			            hidden: true,
			            flex: 0,
			            url   : ''
			        },
			        {
			            xtype : 'button',
			            iconCls: 'rewind',
			            id : 'rewindButton'
			        },
			        {
			            xtype : 'button',
			            ui : 'confirm',
			            iconCls: 'play',
			            id : 'playButton'
			        },
			        {
			            xtype : 'button',
			            iconCls: 'fastforward',
			            id : 'fastforwardButton'
			        }
		        ]
	        }
        ]
    }
});
