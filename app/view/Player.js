Ext.define('Muzic.view.Player', {

    extend: 'Ext.Panel',
    xtype: 'player',
    requires: [
    	'Ext.Audio'
    ],

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
		        	flex : 1
		        },
		        items: [
			        {
			            xtype : 'audio',
			            id : 'audioPlayer',
			            hidden: true,
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
