Ext.define('Muzic.view.albums.Card', {

    extend: 'Ext.NestedList',
    xtype: 'nestedlist',

    config: {
        iconCls: 'album',
		title: 'Artists',
		store: 'Artists',
		id: 'artistsNL',
        displayField: 'title'   
    }
});
