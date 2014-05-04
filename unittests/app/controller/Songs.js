describe('Muzic.controller.Songs', function () {
  var controller, app;
  beforeEach(function () {
    app = Ext.create('Ext.app.Application', {name: 'Muzic'});
    controller = Ext.create('Muzic.controller.Songs', { application: app });
    controller.init();
    controller.launch();
  });

  it('should stop playing', function () {
  	//var audio = Ext.create('Ext.Audio');
  	//audio.setUrl('file:///storage/sdcard/Music/crash.mp3');
  	controller.getAudioPlayer().play();
  	console.log(controller.getAudioPlayer());
  	console.log(controller.getAudioPlayer().isPlaying());
  	console.log(controller);
    controller.toggleAudioPlayback(controller.getAudioPlayer());
    console.log(controller.getAudioPlayer());
    console.log(controller.getAudioPlayer().isPlaying());
    console.log("ende");
    expect(controller.getAudioPlayer().isPlaying()).toBeFalsy;
    /*expect(controller.onPauseButtonTap).toEqual('Muzic.model.Song');
    expect(order.phantom).toBeTruthy();*/
  });
  /*it('#newOrder', function () {
  	var audio = Ext.create('Ext.Audio');
    var order = controller.onPauseButtonTap();
    expect(order.$className).toEqual('Muzic.model.Song');
    expect(order.phantom).toBeTruthy();
  });*/
 
  afterEach(function () {
    app.destroy();
    document.getElementById('mytest').innerHTML = "";
  });
});