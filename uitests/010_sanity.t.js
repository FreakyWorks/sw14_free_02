testUI = true;
StartTest(function(t) {
    t.diag("Sanity");

    t.ok(Ext, 'ExtJS is here');


    t.ok(Muzic, 'My project is here');
    t.ok(Muzic.util.FileRead, '.. indeed');

    t.chain(
        { 
            waitFor : 'CQ', 
            args    : 'player',
            desc    : 'Should find pause button on app start'
        },
        
        function(next) {
            t.ok(t.cq1('#pauseButton'), 'Should find a pause button');
        }
    );


    t.done();   // Optional, marks the correct exit point from the test
});