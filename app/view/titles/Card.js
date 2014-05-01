Ext.define('Muzic.view.titles.Card', {

    extend: 'Ext.Panel',
    xtype: 'titleContainer',
    requires: [
    	'Ext.TitleBar',
    	'Ext.dataview.List',
    	'Ext.Audio'
    ],

    config: {

        title: 'Songs',
        iconCls: 'time',
        layout: 'vbox',

        autoDestroy: false,

        items: [
            {
                docked: 'top',
                xtype: 'titlebar',
                title: 'All Songs',
                items: [
                	{
                		//iconCls: 'pause',
                		text: 'Play',
                		xtype: 'button',
                		iconMask: true,
                		align: 'right',
                		id: 'pauseButton'
                	}
                ]
                
            },
            {
				xtype: 'list',
				store: 'Songs', // <tpl if="alreadyHeard">isdone</tpl>
				itemTpl: '<tpl for=".">\
							<div class="songtitle">{title}</div>\
							<div class="songalbum">{album}</div>\
						  </tpl>',
			    flex: 1			
            },
	        {
	            xtype : 'audio',
	            hidden: true,
	            url   : 'resources/crash.mp3'
	        }
        ]
    }
});
