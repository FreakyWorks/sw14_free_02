Ext.define('Muzic.view.albums.Card', {

    extend: 'Ext.NestedList',
    xtype: 'nestedlist',

    requires: [
    	'Ext.dataview.List',
    	'Ext.TitleBar'
    ],

    config: {
        iconCls: 'album',
		title: 'Artists',
		store: 'Artists',
        displayField: 'title'
    }
});
