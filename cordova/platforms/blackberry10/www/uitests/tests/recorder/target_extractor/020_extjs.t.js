StartTest(function (t) {
    
    var panel

    t.it('Extracting component query should work', function (t) {
        var extractor       = new Siesta.Recorder.TargetExtractor.ExtJS({
            Ext     : function () { return Ext }
        })
        
        var tbar, bbar
        
        panel && panel.destroy()
        
        panel               = new Ext.panel.Panel({
            id      : 'foo',
            
            items   : [
                {
                    xtype       : 'container',
                    itemId      : 'bar'
                }
            ],
            
            tbar    : tbar = new Ext.toolbar.Toolbar({
                items : [
                    {
                        text        : 'Ok'
                    },
                    {
                        text        : 'Cancel'
                    }
                ]
            }),
            
            bbar    : bbar = new Ext.toolbar.Toolbar({
                itemId  : 'bottom',
                
                items : [
                    {
                        text        : 'Ok'
                    },
                    {
                        text        : 'Cancel'
                    }
                ]
            })
        })
        
        t.is(extractor.findComponentQueryFor(panel.items.getAt(0)).query, '#foo [itemId=bar]', 'The #id selector is always included, even when redundant')
        
        t.is(extractor.findComponentQueryFor(tbar.items.getAt(0)).query, '#foo button[text=Ok]', 'The #id selector is always included, even when redundant')
        t.is(extractor.findComponentQueryFor(bbar.items.getAt(0)).query, '#foo [itemId=bottom] button[text=Ok]', 'The #id selector is always included, even when redundant')
    });
    
    
    t.it('Extracting css query should work', function (t) {
        var extractor       = new Siesta.Recorder.TargetExtractor.ExtJS({
            Ext     : function () { return Ext }
        })
        
        var tbar, bbar
        
        panel && panel.destroy()
        
        panel               = new Ext.panel.Panel({
            items   : [
                {
                    xtype       : 'container',
                    itemId      : 'bar'
                }
            ],
            
            tbar    : tbar = new Ext.toolbar.Toolbar({
                items : [
                    {
                        text        : 'Ok'
                    },
                    {
                        text        : 'Cancel'
                    }
                ]
            }),
            
            bbar    : bbar = new Ext.toolbar.Toolbar({
                itemId  : 'bottom',
                
                items : [
                    {
                        text        : 'Ok'
                    },
                    {
                        text        : 'Cancel'
                    }
                ]
            })
        })
        
        t.is(extractor.findComponentQueryFor(panel.items.getAt(0)).query, '[itemId=bar]', 'Correct component query found')
        
        t.is(extractor.findComponentQueryFor(tbar.items.getAt(0)).query, 'panel button[text=Ok]', 'This query is bad, because it matches more than one component, but the one of interest is the first')
        t.is(extractor.findComponentQueryFor(bbar.items.getAt(0)).query, '[itemId=bottom] button[text=Ok]', 'Correct component query found')
    })
    
    
    t.it('Extracting composite query should work', function (t) {
        var extractor       = new Siesta.Recorder.TargetExtractor.ExtJS({
            Ext     : function () { return Ext }
        })
        
        var tbar, bbar
        
        panel && panel.destroy()
        
        panel               = new Ext.panel.Panel({
            renderTo        : document.body,
            
            items   : [
                {
                    xtype       : 'container',
                    itemId      : 'bar',
                    html        : '<p class="bar">Some text</p>'
                }
            ],
            
            tbar    : tbar = new Ext.toolbar.Toolbar({
                items : [
                    {
                        text        : 'Ok'
                    },
                    {
                        text        : 'Cancel'
                    }
                ]
            }),
            
            bbar    : bbar = new Ext.toolbar.Toolbar({
                itemId  : 'bottom',
                
                items : [
                    {
                        text        : 'Ok'
                    },
                    {
                        text        : 'Cancel'
                    }
                ]
            })
        })
        
        t.is(extractor.findCompositeQueryFor(panel.items.getAt(0).getEl().down('p').dom).query, '[itemId=bar] => .bar', 'Correct composite query found')
        
        t.chain(
            function (next) {
                document.onclick = function (event) {
                    var targets = extractor.getTargets(event)
                    
                    t.isDeeply(targets[ 0 ], { type : 'csq', target : '[itemId=bar] => .bar', offset : t.any() }, "Correct best target")
                }
                
                t.click(panel.items.getAt(0), next)
            },
            function () {
                document.onclick = null
            }
        )
    })
    
    
    t.it('Extracting composite query should work', function (t) {
        var extractor       = new Siesta.Recorder.TargetExtractor.ExtJS({
            Ext     : function () { return Ext }
        })
        
        panel && panel.destroy()
        
        panel               = new Ext.window.Window({
            renderTo    : document.body,
            
            itemId      : 'win',
            x           : 200,
            y           : 0,
            renderTo    : document.body,
            height      : 100,
            width       : 100,
            title       : 'foo'
        })
        
        panel.show()
        
        t.chain(
            function (next) {
                document.onclick = function (event) {
                    var targets = extractor.getTargets(event)
                    
                    t.isDeeply(targets[ 0 ], { type : 'csq', target : '[itemId=win] header[title=foo] => .x-header-text-container', offset : t.any() }, "Correct best target")
                    // css query is placed above the component query, because it points to target element more precisely
                    t.isDeeply(targets[ 1 ], { type : 'css', target : '.x-header-text-container.x-window-header-text-container', offset : t.any() }, "Correct best target")
                    t.isDeeply(targets[ 2 ], { type : 'cq', target : '[itemId=win] header[title=foo]', offset : t.any() }, "Correct best target")
                }
                
                t.click('>>#win header', next)
            },
            function () {
                document.onclick = null
            }
        )
    })
    
})