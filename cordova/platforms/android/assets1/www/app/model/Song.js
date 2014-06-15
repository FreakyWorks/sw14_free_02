Ext.define('Muzic.model.Song', {
	extend: 'Ext.data.Model',

	config: {
		fields: [
			{name: 'title', type: 'string'},
			{name: 'artist', type: 'string'},
			{name: 'album', type: 'string'},
			{name: 'filepath', type: 'string'},
			{name: 'alreadyHeard', type: 'boolean', defaultValue: false}
		],
		validations: [{ type: 'presence', field: 'filepath'}]
	}
	
	

	/*getFullName: function() {
		return this.get('first_name') + ' ' + this.get('last_name');
	}*/
});