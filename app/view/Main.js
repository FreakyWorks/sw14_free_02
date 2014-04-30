Ext.define('Muzic.view.Main', {

	extend: 'Ext.tab.Panel',
	xtype: 'main',

	config: {

		tabBarPosition: 'bottom',
		/*tabBar: {
			ui: 'gray'
		},*/

		items: [
			{ xclass: 'Muzic.view.titles.Card' }/*,
			{ xclass: 'Muzic.view.speaker.Card' },
			{ xclass: 'Muzic.view.about.Card' }*/
		]
	}
});
