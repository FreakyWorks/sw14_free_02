testUI = true;

StartTest(function (t) {
	var previously_playing = undefined;
	var currently_playing = undefined;
    t.diag('Testing our artists list');
    
    t.chain(

    	{ waitFor : 1000 },
    	
    	{ action : 'click', target : t.cq1('#tabbar').items.getAt(1) },
    	
        function(next) {
        	console.log(t.cq1('#tabbar'));
        	next();
        },
        
        { waitFor : 1000 },
        //Hope this works always, but .x-list:not(.x-item-hidden) .x-list-item-first as suggested by Siesta doesnt work
        { action : 'tap', target : '#ext-list-2 .x-list-item-first' },

		{ waitFor : 1000 },
		
		{ action : 'tap', target : '#ext-list-3 .x-list-item-first' },
		
		{ waitFor : 1000 },

        function(next) {
        	t.is(t.cq1('audio').isPlaying(), true, "Audio is playing");
        	//Not working for some reason :/
        	console.log(t.cq1('audio').getUrl());
        	//"<audio preload="auto" class="x-component" id="ext-element-87" src="music_files/01 Mad World.mp3" controls=""></audio>"
        	currently_playing = t.cq1('audio').innerElement.dom.innerHTML;
        	next();
        },
        
        { waitFor : 1000 },
        
        { action : 'tap', target : '>>[ui=back]' },
        
        { tap : '>> #fastforwardButton' },
        
        function(next) {
        	t.is(t.cq1('audio').isPlaying(), true, "Audio is playing");
        	previously_playing = currently_playing;
        	currently_playing = t.cq1('audio').innerElement.dom.innerHTML;
        	t.isnot(currently_playing, previously_playing, 'Changed to next element (Album needs to have at least two songs)');
        	next();
        },
        
        { waitFor : 3000 }
        
    );
});
