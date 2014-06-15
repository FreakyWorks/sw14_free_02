describe('Muzic.controller.Songs', function () {
  var controller, app;
  beforeEach(function () {
    app = Ext.create('Ext.app.Application', {name: 'Muzic'});
    controller = Ext.create('Muzic.controller.Songs', { application: app });
    controller.init();
    controller.launch();
  });

  it('should start playing', function () {
  	//var audio = Ext.create('Ext.Audio');
  	//audio.setUrl('file:///storage/sdcard/Music/crash.mp3');
  	console.log(controller);
  	console.log(controller.getAudioPlayer());
  	console.log(controller.getAudioPlayer().isPlaying());
  	
    controller.toggleAudioPlayback(controller.getAudioPlayer());
    
    console.log(controller.getAudioPlayer());
    console.log(controller.getAudioPlayer().isPlaying());
    expect(controller.toggleAudioPlayback(controller.getAudioPlayer())).toBeTruthy;
    
    console.log(controller.getPlayButtonInRow().getIconCls());
    expect(controller.getPlayButtonInRow().getIconCls()).toMatch('play');
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
    document.getElementById('mytest').innerHTML = "a";
  });
});