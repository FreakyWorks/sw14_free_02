Ext.define('Muzic.view.Main', {

	extend: 'Ext.tab.Panel',
	xtype: 'main',
    requires: [
    	'Muzic.view.titles.Card',
    	'Muzic.view.Player',
		'Muzic.view.albums.Card'
    ],
	fullscreen: true,
	

	config: {
		tabBarPosition: 'bottom',
		/*tabBar: {
			ui: 'gray'
		},*/

		items: [
		   {xclass : 'Muzic.view.titles.Card'},
		   {xclass : 'Muzic.view.albums.Card'}
		]
	}
});
