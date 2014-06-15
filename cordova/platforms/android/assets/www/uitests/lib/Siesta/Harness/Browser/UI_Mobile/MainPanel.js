/*

Siesta 2.0.7
Copyright(c) 2009-2014 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Ext.define('Siesta.Harness.Browser.UI_Mobile.MainPanel', {

    extend          : 'Ext.Panel',
    alias           : 'widget.mainpanel',

    harness         : null,
    mouseVisualizer : null,
    
    config          : {
        layout          : {
            type        : 'card',
            animation   : {
                type        : 'slide',
                direction   : 'left'
            }
        },
        testsStore      : null,
        slots           : true
    },
    
    suiteBar        : null,
    testList        : null,
    resultList      : null,
    
    testsStore      : null,
    flatTestsStore  : null,
    
    showingIframeOfTest     : null,

    constructor : function (config) {
        delete config.title;

        this.callParent(arguments);
        
        // was known as Ext.apply(this, config) previously
        for (var name in config) {
            if (config.hasOwnProperty(name) && name !== 'xtype' && name !== 'xclass' && !this.hasConfig(name)) {
                this[ name ] = config[ name ];
            }
        }        

        this.lastTests      = [];

        var treeData        = this.buildTreeData({
            id          : 'root',
            group       : 'test suite' + this.title,
            items       : this.harness.descriptors
        });

        var testsStore      = this.testsStore = new Ext.data.TreeStore({
            model           : 'Siesta.Harness.Browser.Model.TestFile',
            recursive       : true,
        
            sortOnLoad      : false
        });

        var data            = []
        var root            = testsStore.getRoot()
        
        root.appendChild(treeData.children)
        
        root.cascadeBy(function (node) {
            if (node != root) data.push(node)
        })
        
        var flatTestsStore = this.flatTestsStore = new Ext.data.Store({
            model           : 'Siesta.Harness.Browser.Model.TestFile'
        });
        
        flatTestsStore.add(data)
        
        this.mouseVisualizer    = new Siesta.Harness.Browser.UI.MouseVisualizer({ harness : this.harness })
        
        this.summaryButton      = Ext.create('Siesta.Harness.Browser.UI_Mobile.ResultSummaryButton', {
            scope       : this,
            handler     : this.toggleResults
        });

        this.suiteBar = new Ext.Toolbar({
            docked      : 'top',
            cls         : 'suite-bar',
            items       : [
                { 
                    ui          : 'back', 
                    group       : 'suitebtn',
                    text        : Siesta.Resource('Siesta.Harness.Browser.UI_Mobile.MainPanel', 'backText'),
                    disabled    : true,
                    
                    handler     : this.goBack,
                    scope       : this
                },
                {
                    cls         : 'tr-icon-run-all',
                    group       : 'suitebtn',
                    scope       : this,
                    handler     : this.runAll,
                    text        : '&nbsp;',
                    width       : 50
                }
            ].concat(                
                Ext.os.is.Desktop ? [ 
                {
                    cls         : 'tr-icon-run-failed',
                    group       : 'suitebtn',
                    scope       : this,
                    text        : '&nbsp;',
                    handler     : this.runFailed,
                    width       : 50
                },
                {
                    cls         : 'tr-icon-stop',
                    group       : 'suitebtn',
                    scope       : this,
                    text        : '&nbsp;',
                    handler     : this.stopSuite,
                    width       : 50
                }] : []
            ).concat(
                { 
                    iconMask    : true, 
                    iconCls     : 'refresh', 
                    group       : 'suitebtn',
                    handler     : this.rerunTest,  
                    scope       : this 
                },
                { xtype : 'spacer' },
                this.summaryButton
            )
        });

        this.testList = Ext.create('Siesta.Harness.Browser.UI_Mobile.TestList', {
            listeners   : {
                itemdoubletap       : this.onItemDoubleTap,
                disclose            : this.onItemDisclose,
                            
                scope               : this
            },
                        
            store       : this.flatTestsStore
        });

        this.resultList = Ext.create('Siesta.Harness.Browser.UI_Mobile.ResultList');

        Ext.destroy(Ext.get('splashLoader'));

        this.add([
            this.suiteBar,
            this.testList,
            this.resultList
        ]);
        
        this.harness.on('testendbubbling', this.onEveryTestEnd, this)
    },

    buildTreeData : function (descriptor) {
        var data    = {
            id          : descriptor.id,
            title       : descriptor.group || descriptor.title || descriptor.name || descriptor.url.replace(/(?:.*\/)?([^/]+)$/, '$1'),
            descriptor  : descriptor
        }
    
        var me              = this
        var prevId          = data.id
    
        if (descriptor.group) {
            var children    = []
        
            Ext.each(descriptor.items, function (desc) {
                children.push(me.buildTreeData(desc))
            })
        
            Ext.apply(data, {
                folderStatus    : 'yellow',
                
                expanded        : true,
            
                children        : children,
                leaf            : false
            })
        
        } else {
            Ext.apply(data, {
                url             : descriptor.url,
            
                leaf            : true,
            
                passCount       : 0,
                failCount       : 0,
            
                time            : 0,
            
                assertionsStore : new Ext.data.NodeStore({
                    model       : 'Siesta.Harness.Browser.Model.Assertion',
                    recursive   : true,
                    node        : new Siesta.Harness.Browser.Model.Assertion()
                })
            })
        }
    
        return data
    },


    setTitle : function(title) {
        this.suiteBar.setTitle(title);
    },

    
    goBack : function (backButton) {
        if (this.getActiveItem() === this.testList) {
        } else {
            this.getResultList().hideIFrame();
            
            this.getLayout().getAnimation().setReverse(true)
            
            this.setActiveItem(0);
            backButton.disable()
        }
    },

    
    resetDescriptors : function (descriptors) {
        var flatTestsStore           = this.flatTestsStore
        
        Joose.A.each(this.harness.flattenDescriptors(descriptors), function (descriptor) {
            var testRecord = flatTestsStore.getById(descriptor.id);
            
            if (testRecord.isLeaf()) testRecord.get('assertionsStore').removeAll(true)
            
            testRecord.reject(true);
            
            // HACK mark record as not having any test results
            testRecord.isCleared = true
        });
    },

    
    toggleResults : function () {
        if (this.lastTests.length > 1) {
            var assertions  = this.getFailedAssertions(this.lastTests);
            
            if (!assertions.length) {
                Ext.Msg.alert(Siesta.Resource('Siesta.Harness.Browser.UI_Mobile.MainPanel', 'allTestsPassedText'));
            } else {
                this.resultList.getStore().setData(assertions);
                this.showResultPanel();
            }
        } else {
            this.showResultPanel(this.lastTests[ 0 ]);
        }
    },

    
    getFailedAssertions : function (tests) {
        var assertions      = []

        Ext.each(tests, function (testModel) {
            var failed = testModel.get('test').getFailedAssertions();

            if (failed.length > 0) {
                assertions.push({
                    result      : new Siesta.Result.Diagnostic({
                        description     : Siesta.Resource('Siesta.Harness.Browser.UI_Mobile.MainPanel', 'failedAssertionsForText') + testModel.get('title')
                    })
                });
                Ext.Array.forEach(failed, function (failedResult) {
                    assertions.push({
                        result       : failedResult
                    })
                })
            }
        });

        return assertions;
    },
    
    
    runFailed : function () {
        var descriptors     = []
    
        this.flatTestsStore.each(function (testFileRecord) {
            var test    = testFileRecord.get('test');
        
            if (test && test.isFailed()) {
                descriptors.push(testFileRecord.get('descriptor'));
            }
        })
    
        this.harness.launch(descriptors)
    },


    runAll : function () {
        var descriptors = []
        
        this.flatTestsStore.each(function (testFile) { 
            if (testFile.isLeaf()) descriptors.push(testFile.get('descriptor')) 
        })
        
        this.harness.launch(descriptors)
    },

    
    stopSuite : function (button) {
        this.performStop();
        button.disable()
    
        setTimeout(function () {
        
            button.enable()
        
        }, 1000)
    },

    
    performStop : function() {
        this.harness.needToStop = true;
    
        this.flatTestsStore.each(function (testFileRecord) {
            if (testFileRecord.get('isStarting') && !testFileRecord.get('isStarted')) {
                testFileRecord.set('isStarting', false);
            }
        });
    },

    // looks less nice than setting it only after preload for some reason
    onBeforeScopePreload : function (scopeProvider, url) {
        var testRecord          = this.flatTestsStore.getById(url);
    
        testRecord.set('isStarted', true);
    },

    
    hideSuiteButtons : function() {
        Ext.each(this.suiteBar.query('[group=suitebtn]'), function(btn) { btn.hide(); });
    },

    
    showSuiteButtons : function() {
        Ext.each(this.suiteBar.query('[group=suitebtn]'), function(btn) { btn.show(); });
    },

    
    isTestRunningVisible : function (test) {
        // return false for test's running in popups (not iframes), since we can't show any visual accompaniment for them
        if (!(test.scopeProvider instanceof Scope.Provider.IFrame)) return false;
    
        // if there is a "forced to be on top" test then we only need to compare the tests instances
        if (this.harness.testOfForcedIFrame) {
            return this.harness.testOfForcedIFrame.isFromTheSameGeneration(test)
        }
    
        // otherwise the only possibly visible test is the one of the current assertion grid
        var resultPanel = this.getResultList();
    
        // if resultPanel has no testRecord it hasn't yet been assigned a test record
        if (!resultPanel || !resultPanel.testRecord || !resultPanel.testRecord.get('test').isFromTheSameGeneration(test)) {
            return false;
        }
    
        // now we know that visible assertion grid is from our test and there is no "forced on top" test
        // we only need to check visibility (collapsed / expanded of the right panel 
        return resultPanel.isFrameVisible()
    },
    
    
    showMobileIframe : function (test) {
        if (this.showingIframeOfTest == test) return
        
        this.hideMobileIframe()
        
        var wrapper             = test.scopeProvider.wrapper
        
        if (wrapper) {
            Ext.fly(wrapper).addCls('active')
            
            test.fireEvent('testframeshow')
            
            this.showingIframeOfTest    = test
        }
    },
    
    
    hideMobileIframe : function () {
        var showingIframeOfTest     = this.showingIframeOfTest
        
        if (showingIframeOfTest) {
            var wrapper             = showingIframeOfTest.scopeProvider.wrapper
            
            if (wrapper) {
                Ext.fly(wrapper).removeCls('active')
                
                showingIframeOfTest.fireEvent('testframehide')
            }
            
            this.showingIframeOfTest    = null
        }
    },


    onTestSuiteStart : function (descriptors) {
        var harness             = this.harness
        var flatTestsStore      = this.flatTestsStore
        
        this.summaryButton.resetSummary();

        this.resetDescriptors(descriptors);
        
        this.lastTests          = [];
        
        var me                  = this;

        Joose.A.each(harness.flattenDescriptors(descriptors), function (descriptor) {
            var test            = flatTestsStore.getById(descriptor.id);
            
            me.lastTests.push(test);

            test.set({
                isMissing   : descriptor.isMissing,
                isStarting  : true
            })
        });
        this.hideSuiteButtons();
    },
    
    
    onTestSuiteEnd : function (descriptors) {
        this.showSuiteButtons();
        this.setTitle('');
    },
    
    
    onTestStart : function (test) {
        var testRecord          = this.flatTestsStore.getById(test.url)
        
        testRecord.isCleared    = false
       
        testRecord.beginEdit()
    
        // will trigger an update in grid
        testRecord.set({
            test        : test,
            isRunning   : true
        })
        
        testRecord.endEdit()
        
        testRecord.parentNode && testRecord.parentNode.updateFolderStatus()
        
        this.setTitle(testRecord.get('title') || url);
        
        this.showMobileIframe(test)
    },


    onTestUpdate : function (test, result, parentResult) {
        var testRecord      = this.flatTestsStore.getById(test.url)
        
        if (testRecord.get('test').isFromTheSameGeneration(test)) {
            var failCount       = test.getFailCount(),
                passCount       = test.getPassCount(),
                diffPass        = passCount - testRecord.get('passCount'),
                diffFail        = failCount - testRecord.get('failCount');
            
            var assertionStore  = testRecord.get('assertionsStore');
        
            testRecord.beginEdit()
    
            testRecord.set({
                'passCount'         : passCount,
                'failCount'         : failCount,
                'todoPassCount'     : test.getTodoPassCount(),
                'todoFailCount'     : test.getTodoFailCount()
            });
        
            testRecord.endEdit()
            
            var data = {
                id                  : result.id,
                result              : result,
                
                leaf                : !(result instanceof Siesta.Result.SubTest),
                expanded            : true
            };
            
            // we use NodeStore instead of TreeStore and `nodeStore.data.getByKey` instead of `nodeStore.getById`
            // because of http://www.sencha.com/forum/showthread.php?265546-2.2.0-2.2.1-getNodeById-method-of-the-Ext.data.TreeStore-does-not-work&p=972912#post972912
            // NodeStore has similar issues
            var alreadyInTheStore   = assertionStore.data.getByKey(result.id)
            
            if (alreadyInTheStore) {
                alreadyInTheStore.afterEdit([], {});
                
                if (result.completed) {
                    this.summaryButton.updateSummary(diffPass, diffFail);
                }
            } else {
                var parentNode      = assertionStore.data.getByKey(parentResult.id) || assertionStore.getNode()
                
                alreadyInTheStore   = parentNode.appendChild(data);
                
                this.summaryButton.updateSummary(diffPass, diffFail);
            }
            
            alreadyInTheStore.updateFolderStatus()
            
            testRecord.parentNode && testRecord.parentNode.updateFolderStatus()
        }
    },


    // only called for top-level tests
    onTestEnd : function (test) {
        if (test == this.showingIframeOfTest) this.hideMobileIframe()
        
        var testRecord          = this.flatTestsStore.getById(test.url)
        
        if (testRecord.get('test').isFromTheSameGeneration(test)) {
            // changing the time field to trigger the refresh of the test row, which will
            // also update the icon
            testRecord.set('time', test.getDuration() + 'ms')
        
            testRecord.parentNode && testRecord.parentNode.updateFolderStatus()
        }
    },
    
    
    // is bubbling and thus triggered for all tests (including sub-tests) 
    onEveryTestEnd : function (event, test) {
        var testRecord          = this.flatTestsStore.getById(test.url)
        
        // need to check that test record contains the same test instance as the test in arguments (or its sub-test)
        // test instance may change if user has restarted a test for example
        if (testRecord.get('test').isFromTheSameGeneration(test)) {
            var testResultNode  = testRecord.get('assertionsStore').data.getByKey(test.getResults().id)
            
            // can be missing for "root" tests
            testResultNode && testResultNode.updateFolderStatus()
        }
    },
    

    onTestFail : function (test, exception, stack) {
        var testRecord  = this.flatTestsStore.getById(test.url)
        
        if (testRecord.get('test').isFromTheSameGeneration(test) && !test.isTodo) {
            testRecord.set('isFailed', true)
        
            testRecord.parentNode && testRecord.parentNode.updateFolderStatus()
        }
    },
    
    
    onItemDoubleTap : function (list, index, target, testModel) {
        this.launchTest(testModel);
    },
    
    
    onItemDisclose : function (list, testModel, target, index) {
        var me      = this
        
        var cont    = function () {
            me.showResultPanel(testModel);    
        }
        
        if (testModel.isCleared || !testModel.get('test')) 
            this.launchTest(testModel, cont);
        else
            cont()
    },

    
    showResultPanel : function (testModel) {
        var resultList      = this.getResultList()
        
        if (testModel) resultList.showTest(testModel.get('test'), testModel.get('assertionsStore'));
        
        this.suiteBar.down("button[ui='back']").enable()
        
        this.getLayout().getAnimation().setReverse(false)
        
        this.setActiveItem(resultList);
    },

    
    getResultList : function() {
        return this.resultList;
    },

    
    getFilesTree : function() {
        return this.down('testlist');
    },

    
    launchTest : function (testFile, callback) {
        this.harness.launch([ testFile.get('descriptor') ], callback)
    },

    
    rerunTest : function () {
        this.launchTest(this.lastTests[ this.lastTests.length - 1 ]);
    }
})
//eof Siesta.Harness.Browser.UI_Mobile.MainPanel
