var Harness = Siesta.Harness.Browser.SenchaTouch;

Harness.configure({
    title       : 'Muzic Test Suite',

    preload     : [
        // version of ExtJS used by your application
        '../touch/resources/css/base.css',
        //'../resources/css/app.css',

        // version of ExtJS used by your application
        '../touch/sencha-touch-all-debug.js',
        //'../app.js'
    ]
});

Harness.start(
    '010_sanity.t.js',
    '020_basic.t.js'/*,
    {
        group           : 'Application tests',
        hostPageUrl     : '../',
        performSetup    : false,       // This is done by the app itself
        items           : [
            'DemoApp/tests/100_sanity.t.js',
            'DemoApp/tests/101_login.t.js',
            'DemoApp/tests/102_logout.t.js'
        ]
    }*/
);