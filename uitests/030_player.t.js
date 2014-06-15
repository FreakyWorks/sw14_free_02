testUI = true;
StartTest(function(t) {
	var button = Ext.ComponentQuery.query('#playButton');
	console.log(button);
	console.log("here");
	t.is(button.length, 1, 'Found one button');
	t.willFireNTimes(button[0], 'tap', 2, 'Click playButton Button two times');
    t.chain(
        { waitFor : 'componentVisible', args : '#playButton' },
        { waitFor : 2000},
		
       function(next) {
       		console.log(t.cq1('#playButton').getIconCls());
        	var button_icon = t.cq1('#playButton').getIconCls();
        	t.is(button_icon, "play", 'Button icon is Play at start');
        	t.is(t.cq1('audio').isPlaying(), false, "Audio isn't playing on start");
            next();
        },
        
		{ tap : '>> #playButton' },
		
        function(next) {
			var should_path = Ext.getStore('Songs').first().getData().filepath;
			//Player.getUrl() not working, using workaround, may now work if id too long
			//"<audio preload="auto" class="x-component" id="ext-element-87" src="music_files/01 Mad World.mp3" controls=""></audio>"
        	var is_path = t.cq1('audio').innerElement.dom.innerHTML.slice(67);
        	for(var counter = 0; counter < is_path.length; counter++) {
        		if (is_path[counter] === '\"') {
        			is_path = is_path.substring(0, counter);
        			break;
        		}
        	}
        	t.is(is_path, should_path, 'First element in list is selected for playing');
        	var button_icon = t.cq1('#playButton').getIconCls();
        	t.is(button_icon, "pause", 'Button icon is Pause after pressing');
        	t.is(t.cq1('audio').isPlaying(), true, 'Audio is playing after button press');
            next();
        },

        { waitFor : 3000 },
        
        { tap : '>> #playButton' },
        
        function(next) {
        	var button_icon = t.cq1('#playButton').getIconCls();
        	t.is(button_icon, "play", 'Button text is Play after pressing again');
        	t.is(t.cq1('audio').isPlaying(), false, 'Audio paused after button press');
            t.done();
        }
    );
});
