Ext.define('Muzic.view.Main', {

	extend: 'Ext.tab.Panel',
	xtype: 'main',

	config: {

		tabBarPosition: 'bottom',
		/*tabBar: {
			ui: 'gray'
		},*/

		items: [
			{
                docked: 'top',
                xtype: 'titlebar',
                title: 'Muzic',
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
			{ xclass: 'Muzic.view.titles.Card' },
			{ xclass: 'Muzic.view.Player' }
		]
	}
});
