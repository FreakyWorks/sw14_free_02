describe('Muzic.controller.Player', function () {
  var controller, app;
  beforeEach(function () {
    app = Ext.create('Ext.app.Application', {name: 'Muzic'});
    controller = Ext.create('Muzic.controller.Player', { application: app });
    controller.init();
    controller.launch();
  });

  it('should start playing', function () {
  	//var audio = Ext.create('Ext.Audio');
  	//audio.setUrl('file:///storage/sdcard/Music/crash.mp3');
  	console.log(controller);
  	console.log(controller.getAudioPlayer());
  	//console.log(controller.getAudioPlayer().isPlaying());
  	
    controller.toggleAudioPlayback(controller.getAudioPlayer());
    
    console.log(controller.getAudioPlayer());
    //console.log(controller.getAudioPlayer().isPlaying());
    expect(controller.toggleAudioPlayback(controller.getAudioPlayer())).toBeTruthy;
    //Better test this with Siesta, working much better with Sencha together
  });
 
  afterEach(function () {
    app.destroy();
    document.getElementById('mytest').innerHTML = "";
  });
});