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
	            url   : 'http://www.snapshotsisters.com/wp-content/uploads/2010/10/09-Make-You-Feel-My-Love.mp3'
	        }
        ]
    }
});
