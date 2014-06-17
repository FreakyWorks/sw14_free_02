Ext.define('Muzic.store.Songs', {
	extend: 'Ext.data.Store',

    config: {
    	storeId: 'Songs',
        model: 'Muzic.model.Song',
        //for testing:
        data : [
        	/*{title: 'mysong', album: 'myalbum', filepath: ''},
        	{title: 'mysong', album: 'myalbum', filepath: 'store/ersdf/esrs'},
        	{title: 'mysong', album: 'myalbum', filepath: 'store/ersdf/esrs'},
        	{title: 'mysong', album: 'myalbum', filepath: 'store/ersdf/esrs'},
        	{title: 'mysong', album: 'myalbum', filepath: 'store/ersdf/esrs'}*/
        ],
        proxy: {
        	type: 'memory',
	        reader: {
	            type: 'json',
	            rootProperty: 'items'
	        }
        },
        sorters: [
        {
            property : "title",
            direction: "ASC"
        }
    ]
    }
});
