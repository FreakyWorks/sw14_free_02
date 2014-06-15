testUI = true;
StartTest(function(t) {

    t.chain(
        { waitFor : 'event', args : ['#search', 'painted']},
        { waitFor : 2000 },
        
        //Typing doesn't seem to work : https://bryntum.com/forum/viewtopic.php?f=20&t=2812
        
        { action : 'tap', target : '#search' },
        { action : 'type',  target : '#search', text : 'Mad' }, 
        { waitFor : 2000 },
		
       function(next) {
       		//Doesnt fire event :(
       		//t.cq1('#search').setValue('Mad');
       		t.is(t.cq1('#search').getValue(), 'Mad', 'Typing doesnt seem to work on search field in Siesta: https://bryntum.com/forum/viewtopic.php?f=20&t=2812');
       		//TODO add checking for store if it works
       		console.log(Ext.getStore('Artists'));
            next();
        },
        
        { action : 'tap', target : t.cq1('#search').element.down('.x-clear-icon') },
    
        function() {
            t.is(t.cq1('#search').getValue(), '', 'Cleared filter');
            t.done();
        }
    );
});
