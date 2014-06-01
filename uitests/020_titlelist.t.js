testUI = true;
StartTest(function (t) {
    t.diag('Testing our songs list');
    
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
        	var should_path = Ext.getStore('Songs').last().getData().filepath;
            var sel = t.cq1('#mySongList').getSelection();
            console.log(sel[0]);
            t.is(sel.length, 1, '1 item is selected');
            t.is(sel[0].data.filepath, should_path, should_path + ' is selected');

            // Let's go back up
            t.scrollUntilElementVisible(t.cq1('#mySongList').element, 'up', t.cq1('#mySongList').element.down('.x-list-item-first'), next);
        	
        	button_text = t.cq1('#pauseButton').textElement.dom.innerHTML;
        	t.is(button_text, "Pause", 'Button text is Pause after clicking element in list');
        	t.is(t.cq1('audio').isPlaying(), true, "Audio is playing");
            t.done();
        }
    );
});
