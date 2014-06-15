Ext.define('Muzic.model.Artist', {
	extend: 'Ext.data.Model',

	config: {
	    fields: [
	        {name: 'title', type: 'string'}
	    ],
	    hasMany: {model: 'Song', name: 'title'}
	}
});