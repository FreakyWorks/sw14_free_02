StartTest(function (t) {
    t.diag('Testing our songs list');
        	    	console.log(t);
    t.chain(

    	{ waitFor : 1000 },
    	
        function(next) {

            t.scrollUntilElementVisible(t.cq1('#mySongList'), 'down', '.x-list-item-last', next);
        },

        function(next) {
            t.pass('Scrolled last item into view');
            next();
        },

        { action : 'tap', target : '.x-list-item-last' },

        function(next) {
            var sel = t.cq1('#mySongList').getSelection();
            t.is(sel.length, 1, '1 item is selected');
            t.is(sel[0].get('songtitle'), 'crash', 'The might Sir Animal is selected');

            // Let's go back up
            t.scrollUntilElementVisible(t.cq1('#mySongList').element, 'up', t.cq1('#mySongList').element.down('.x-list-item-first'), next);
        }
    );
});
