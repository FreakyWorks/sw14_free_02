testUI = true;
StartTest(function(t) {
	var button = Ext.ComponentQuery.query('#pauseButton');
	t.is(button.length, 1, 'Found one button');
    t.chain(
        { waitFor : 'componentVisible', args : '#pauseButton' },
        { waitFor : 2000 },
		
       function(next) {
        	button_text = t.cq1('#pauseButton').textElement.dom.innerHTML;
        	t.is(button_text, "Play", 'Button text is Play at start');
        	t.is(t.cq1('audio').isPlaying(), false, "Audio isn't playing on start");
            next();
        },
        
		{ tap : '>> #pauseButton' },
		
        function(next) {
			var should_path = Ext.getStore('Songs').first().getData().filepath;
        	var is_path = t.cq1('audio').getUrl( );
        	console.log(is_path);
        	
        	var duration = t.cq1('audio').getDuration( );
        	
        	t.is(is_path, should_path, 'First element in list is selected for playing');
        	button_text = t.cq1('#pauseButton').textElement.dom.innerHTML;
        	t.is(button_text, "Pause", 'Button text is Pause after pressing');
        	t.is(t.cq1('audio').isPlaying(), true, 'Audio is playing after button press');
            next();
        },
		

        { waitFor : 3000 },
        
        { tap : '>> #pauseButton' },
        
        function(next) {
        	var button_text = t.cq1('#pauseButton').textElement.dom.innerHTML;
        	t.is(button_text, "Play", 'Button text is Play after pressing again');
        	t.is(t.cq1('audio').isPlaying(), false, 'Audio paused after button press');
            next();
            t.done();
        }
    );
});
