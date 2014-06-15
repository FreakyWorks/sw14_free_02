StartTest(function(t) {
    t.diag("Sanity");

    t.ok(Ext, 'ExtJS is here');


    t.ok(Muzic, 'My project is here');
    t.ok(Muzic.util.FileRead, '.. indeed');

    t.done();   // Optional, marks the correct exit point from the test
});