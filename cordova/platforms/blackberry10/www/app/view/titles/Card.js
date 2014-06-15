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
				id: 'mySongList',
				name: 'songlist',
				store: 'Songs', // <tpl if="alreadyHeard">isdone</tpl>
				itemTpl: '<tpl for=".">\
							<div class="songtitle">{title}</div>\
							<div class="songalbum">{album}</div>\
						  </tpl>',
			    flex: 1			
            },
            {
				html: '<a href="unittests/SpecRunner.html">Test</a> <a href="uitest.html">Test UI</a>'
			}
        ]
    }
});
