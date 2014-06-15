describe('Muzic.controller.Songs', function () {
  var controller, app;
  beforeEach(function () {
    app = Ext.create('Ext.app.Application', {name: 'Muzic'});
    controller = Ext.create('Muzic.controller.Songs', { application: app });
    controller.launch();
  });

  it('#play', function () {
  	var audio = Ext.create('Ext.Audio');
    var order = controller.onPauseButtonTap();
    expect(controller.onPauseButtonTap).toEqual('Muzic.model.Song');
    expect(order.phantom).toBeTruthy();
  });
  /*it('#newOrder', function () {
  	var audio = Ext.create('Ext.Audio');
    var order = controller.onPauseButtonTap();
    expect(order.$className).toEqual('Muzic.model.Song');
    expect(order.phantom).toBeTruthy();
  });*/
 
  afterEach(function () {
    app.destroy();
  });
});