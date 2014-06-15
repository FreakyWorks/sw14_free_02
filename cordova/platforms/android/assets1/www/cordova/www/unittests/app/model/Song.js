describe('Muzic.model.Song', function() {
	 it('exists', function() {
	   var model = Ext.create('Muzic.model.Song');
	   expect(model.$className).toEqual('Muzic.model.Song');
	 });
  
	it('returns default value', function() {
	  var model = Ext.create('Muzic.model.Song');
	  expect(model.get('alreadyHeard')).toEqual(false);
	});
	
	it('requires a filepath', function() {
	  var model = Ext.create('Muzic.model.Song');
	  console.log(model);
	  var errors = model.validate();
	  console.log(errors);
	  expect(errors.isValid()).toBeFalsy();
	
	  expect(errors.getByField('filepath')[0].getMessage()).toEqual('must be present');
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

