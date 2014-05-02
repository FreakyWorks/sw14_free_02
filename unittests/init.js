Ext.Loader.setConfig({
    enabled: true,                  // Turn on Ext.Loader
    disableCaching: false           // Turn OFF cache BUSTING
});

Ext.Loader.setPath({
    'Muzic': 'app'              // Set the path for all Muzic.* classes
});

Ext.application({
    name: 'Muzic'               // Create (but don't launch) an application
});


Ext.require('Ext.data.Model');

afterEach(function () {
    Ext.data.Model.cache = {};      // Clear any cached models
});

//Hack - remove
var domEl = document.createElement('div');
domEl.setAttribute('id', 'jasmine_content');
/*
var domEl;
beforeEach(function () {            // Reset the div with a new one.
    domEl = document.createElement('div');
    domEl.setAttribute('id', 'jasmine_content');
    var oldEl = document.getElementById('jasmine_content');
    oldEl.parentNode.replaceChild(domEl, oldEl);
});

afterEach(function () {             // Make the test runner look pretty
    domEl.setAttribute('style', 'display:none;');
});*/