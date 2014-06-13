Ext.define('Muzic.store.Artists', {
	extend: 'Ext.data.TreeStore',

    config: {
    	storeId: 'Artists',
        model: 'Muzic.model.Artist',
        //for testing:
        /*proxy: {
        	type: 'ajax',
        	url: '/data/catalogue.json',
        	        reader: {
            type: 'json',
            root: 'items'
        }
        }*/
    }
});
