var Harness = Siesta.Harness.Browser.SenchaTouch;

Harness.configure({
    title       : 'Muzic Test Suite',

    preload     : [
        // version of ExtJS used by your application
        '../touch/resources/css/base.css',
        '../resources/css/app.css',

        // version of ExtJS used by your application
        '../touch/sencha-touch-all.js',
        '../app.js'
    ],

    keepNLastResults    : 2
});

Harness.start(
    {
        group           : 'Application tests',
        hostPageUrl     : '../',
        performSetup    : false,       // This is done by the app itself
        items           : [
            '010_sanity.t.js',/*
            'DemoApp/tests/101_login.t.js',
            'DemoApp/tests/102_logout.t.js'*/
        ]
    }
);
