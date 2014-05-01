Ext.define('Muzic.view.Player', {

    extend: 'Ext.Panel',
    xtype: 'player',
    requires: [
    	'Ext.Audio'
    ],

    config: {

        title: 'Playing',
        iconCls: 'time',
        layout: 'vbox',

        autoDestroy: false,

        items: [
	        {
	            xtype : 'audio',
	            hidden: true,
	            url   : 'resources/crash.mp3'
	        }
        ]
    }
});
