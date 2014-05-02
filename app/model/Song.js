Ext.define('Muzic.model.Song', {
	extend: 'Ext.data.Model',

	config: {
		fields: [
			{name: 'title', type: 'string'},
			{name: 'album', type: 'string'},
			{name: 'filepath', type: 'string'},
			{name: 'artist', type: 'string'},
			{name: 'year', type: 'string'},
			{name: 'comment', type: 'string'},
			{name: 'genre', type: 'string'},
			{name: 'tracknumber', type: 'int'},
			{name: 'duration', type: 'int'},
			{name: 'size', type: 'int'},
			{name: 'id3version', type: 'int'},
			{name: 'modified', type: 'boolean'},
			{name: 'duplicationcount', type: 'int'},
			{name: 'duplicationID', type: 'int'},
			{name: 'alreadyHeard', type: 'boolean', defaultValue: false}
		],
		validations: [{ type: 'presence', field: 'filepath'}]
	}
	
	

	/*getFullName: function() {
		return this.get('first_name') + ' ' + this.get('last_name');
	}*/
});