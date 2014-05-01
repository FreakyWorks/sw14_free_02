Ext.define('Muzic.view.titles.Card', {

    extend: 'Ext.Panel',
    xtype: 'titleContainer',
    requires: [
    	'Ext.dataview.List',
    	'Ext.TitleBar'
    ],

    config: {

        title: 'Songs',
        iconCls: 'time',
        layout: 'vbox',

        autoDestroy: false,

        items: [
            {
				xtype: 'list',
				name: 'songlist',
				store: 'Songs', // <tpl if="alreadyHeard">isdone</tpl>
				itemTpl: '<tpl for=".">\
							<div class="songtitle">{title}</div>\
							<div class="songalbum">{album}</div>\
						  </tpl>',
			    flex: 1			
            }
        ]
    }
});
