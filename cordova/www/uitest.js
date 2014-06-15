var Harness = Siesta.Harness.Browser.SenchaTouch;

Harness.configure({
    title       : 'Muzic Test Suite',

    preload     : [
	    {
	        text    : 'document.addEventListener("DOMContentLoaded", function(event) { var el = document.createElement("div"); el.id = "appLoadingIndicator"; document.body.appendChild(el) })'
	    },
    	//'cordova.js',
        // version of ExtJS used by your application
        'touch/resources/css/base.css',
        'resources/css/app.css',

        // version of ExtJS used by your application
        'touch/sencha-touch-all-debug.js',
        'app.js'
    ],
    loaderPath  : { 'Muzic' : 'app' },
	performSetup: false/*,
    keepNLastResults    : 2*/
});

Harness.start(
	'uitests/010_sanity.t.js',
	'uitests/030_player.t.js',
	'uitests/020_titlelist.t.js',
	'uitests/050_player_button_row.t.js',
	'uitests/060_search.t.js',
	'uitests/070_artists_view.t.js'
    /*{
        group           : 'Application tests',
        hostPageUrl     : './',
        performSetup    : false,       // This is done by the app itself
        items           : [
            '010_sanity.t.js'/*
            'DemoApp/tests/101_login.t.js',
            'DemoApp/tests/102_logout.t.js'
        ]
    }*/
);
