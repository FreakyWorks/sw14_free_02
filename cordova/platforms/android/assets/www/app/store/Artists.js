Ext.define('Muzic.store.Artists', {
	extend: 'Ext.data.TreeStore',

    config: {
    	storeId: 'Artists',
        model: 'Muzic.model.Song',
        //for testing:
        /*proxy: {
        	type: 'ajax',
        	url: '/data/catalogue.json',
	        reader: {
	            type: 'json',
	            root: 'items'
	        }
        }*/
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
