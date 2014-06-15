testUI = true;
StartTest(function (t) {
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

        function(next) {
        	t.is(t.cq1('audio').isPlaying(), true, "Audio is playing");
        }
    );
});
