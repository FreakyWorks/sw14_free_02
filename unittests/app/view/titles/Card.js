Ext.require('Muzic.view.titles.Card');

describe('Muzic.view.titles.Card', function () {
  it("has a list of tracks", function () {
    var store = Ext.create('Muzic.store.Songs', {
    	data: [
			{title: 'mysong', album: 'myalbum', filepath: ''},
        	{title: 'mysong', album: 'myalbum', filepath: 'store/ersdf/esrs'},
        	{title: 'mysong', album: 'myalbum', filepath: 'store/ersdf/esrs'},
        	{title: 'mysong', album: 'myalbum', filepath: 'store/ersdf/esrs'},
        	{title: 'mysong', album: 'myalbum', filepath: 'store/ersdf/esrs'}
    	]
    });
    console.log(store);
    var view = Ext.create('Muzic.view.titles.Card', {
      renderTo: mytest,
      store: store
    });

    expect(Ext.DomQuery.select('.songtitle').map(function (el) {
    	console.log(el);
      return el.textContent;
    }).join(', ')).toEqual('mysong, mysong, mysong, mysong, mysong');
    
    expect(Ext.DomQuery.select('.songalbum').map(function (el) {
      return el.textContent;
    }).join(', ')).toEqual('myalbum, myalbum, myalbum, myalbum, myalbum');

	//delete everything from our view
	afterEach(function () {
    	document.getElementById('mytest').innerHTML = "";
  	});
  });
});