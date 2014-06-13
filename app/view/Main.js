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

            /*{
                iconCls: 'action',
                    title: 'Nested List',
                    xtype: 'nestedlist',
                    id:'test',
                    displayField: 'text',
		        items: [{
		            text: 'Option A',
		            items: [
		                {text: 'Option A.1'},
		                {text: 'Option A.2'}
		            ]
		        }, {
		            text: 'Option B',
		            items: [
		                {text: 'Option B.1'},
		                {text: 'Option B.2'}
		            ]
		        }]
		    }*/
		   {xclass : 'Muzic.view.titles.Card'},
		   {xclass : 'Muzic.view.albums.Card'}
		   
		]
	}
});
