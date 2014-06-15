Ext.define('Muzic.view.titles.Card', {

    extend: 'Ext.Panel',
    xtype: 'titleContainer',
    requires: [
    	'Ext.dataview.List',
    	'Ext.TitleBar',
    	'Ext.field.Search'
    ],

    config: {

        title: 'Songs',
        emptyText : 'No Music available.',
        iconCls: 'music',
        layout: 'vbox',

        autoDestroy: false,

        items: [
			{
                docked: 'top',
                xtype: 'toolbar',
                id: 'titleBar',
                //title: 'Muzic',
                items: [
                	{ xtype: 'spacer' },
                	{
                		xtype: 'searchfield',
    		            name: 'search',
    		            id: 'search',
    		            autoComplete: true,
    		            autoCorrect: false,
          				placeHolder: 'Filter'
                	},
                	{ xtype: 'spacer' }
                ]
            },
        
            {
				xtype: 'list',
				id: 'mySongList',
				name: 'songlist',
				store: 'Songs',
				itemTpl: '<tpl for=".">\
							<div class="songtitle">{title}</div>\
							<div class="songalbum">{album}</div>\
						  </tpl>',
			    flex: 1			
            },
            {
				html: '<a href="unittests/SpecRunner.html">Test</a>'
			}
        ]
    }
});
