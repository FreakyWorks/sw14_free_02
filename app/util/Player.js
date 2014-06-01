Ext.define('Muzic.util.Player', {

	singleton: true,
	autoDestroy: false,
	config : {
        userSelectedRecord : undefined
   },

	constructor : function(config) {
		this.initConfig(config);
		this.callParent([config]);
	}
});