describe('Muzic.model.Song', function() {
	 it('exists', function() {
	   var model = Ext.create('Muzic.model.Song');
	   expect(model.$className).toEqual('Muzic.model.Song');
	 });
  
	it('returns default value', function() {
	  var model = Ext.create('Muzic.model.Song');
	  expect(model.get('alreadyHeard')).toEqual(false);
	});
  
  	it('returns test data correctly', function () {
	  var model = Ext.create('Muzic.model.Song', {
	    title: 'Jasmine',
	    album: 'ExtJS',
	    filepath: '/dev/null'
	  });
	  expect(model.get('title')).toEqual('Jasmine');
	  expect(model.get('album')).toEqual('ExtJS');
	  expect(model.get('filepath')).toEqual('/dev/null');
	  expect(model.get('alreadyHeard')).toEqual(false);
	});
});

