Ext.define('Muzic.util.Player', {

	singleton: true,
	autoDestroy: false,
	config : {
        userSelectedRecord : undefined
   },

	constructor : function(config) {
		this.initConfig(config);
		this.callParent([config]);
	},
	
	getIdOfUserSelectedRecord : function () {
		if (Muzic.util.Player.getUserSelectedRecord() !== undefined) {
			return parseInt(Muzic.util.Player.getUserSelectedRecord().id.replace( /^\D+/g, ''));
		}
		return undefined;
	}
	
});