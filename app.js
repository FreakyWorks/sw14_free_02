/*
    This file is generated and updated by Sencha Cmd. You can edit this file as
    needed for your application, but these edits will have to be merged by
    Sencha Cmd when it performs code generation tasks such as generating new
    models, controllers or views and when running "sencha app upgrade".

    Ideally changes to this file would be limited and most work would be done
    in other places (such as Controllers). If Sencha Cmd cannot merge your
    changes and its generated code, it will produce a "merge conflict" that you
    will need to resolve manually.
*/
//Ext.require('Muzic.util.FileRead');

//This is already listened to by Sencha!
//document.addEventListener('deviceready', file.requestOurFS() , false);

Ext.application({
	appFolder: '/app',
    name: 'Muzic',
    title: 'Muzic - the Croatian player',

    requires: [
        'Ext.MessageBox',
        'Muzic.util.FileRead',
        'Muzic.util.Database',
        'Muzic.util.Player'
    ],

    icon: {
        '57': 'resources/icons/Icon.png',
        '72': 'resources/icons/Icon~ipad.png',
        '114': 'resources/icons/Icon@2x.png',
        '144': 'resources/icons/Icon~ipad@2x.png'
    },

    isIconPrecomposed: true,

    startupImage: {
        '320x460': 'resources/startup/320x460.jpg',
        '640x920': 'resources/startup/640x920.png',
        '768x1004': 'resources/startup/768x1004.png',
        '748x1024': 'resources/startup/748x1024.png',
        '1536x2008': 'resources/startup/1536x2008.png',
        '1496x2048': 'resources/startup/1496x2048.png'
    },
    
    //models: [ '' ], //will be defined in our Songs controller

    views: [ 'Main',  'titles.Card', 'Player', 'albums.Card' ],
    
    controllers: [ 'Songs', 'Player', 'Artists' ],

    stores: [ 'Songs', 'Artists' ],

    launch: function() {
        // Destroy the #appLoadingIndicator element
        Ext.fly('appLoadingIndicator').destroy();
        
        /*Muzic.util.Proxy.process('data/feed.js', function() {
            Ext.Viewport.add({ xtype: 'main' });
            Ext.Viewport.setMasked(false);
        });*/
        // Initialize the main view
        Ext.Viewport.add(Ext.create('Muzic.view.Main'));
        if(!testUI) {
	        Muzic.util.FileRead.requestDir('Music');  
        }
        else {
	        window.setTimeout(function () {
		        	Muzic.util.Database.openDB();
		        	Muzic.util.Database.createTables();
		         }, 100);
	        window.setTimeout(function () {
		        	Muzic.util.Database.addEntry("Mad World", "Unknown", "music_files/01 Mad World.mp3");
		        	Muzic.util.Database.addEntry("Seven Nation Army", "Unknown", "music_files/01 Seven Nation Army.mp3");
		        	Muzic.util.Database.addEntry("Captain Jack", "Captain Jack", "music_files/Captain Jack - Captain Jack.mp3");
		        	Muzic.util.Database.addEntry("crash", "Sencha", "music_files/crash.mp3");
		        	Muzic.util.Database.addEntry("Wonderful Life", "Seeed", "music_files/Seeed - Wonderful Life.mp3");
		        	Muzic.util.Database.addEntry("Chandelier", "Sia", "music_files/Siva - Chandelier.aac");
		        	Muzic.util.Database.addEntry("What I've Done", "Linkin Park", "music_files/link.mp3");
		        	Muzic.util.Database.addAllEntriesToStore('Songs');
		        	Muzic.util.Database.addAllEntriesToArtistStore('Artists');
		         }, 300);
        }
    },

    onUpdated: function() {
        Ext.Msg.confirm(
            "Application Update",
            "This application has just successfully been updated to the latest version. Reload now?",
            function(buttonId) {
                if (buttonId === 'yes') {
                    window.location.reload();
                }
            }
        );
    }
});
