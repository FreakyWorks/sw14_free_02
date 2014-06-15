/*

Siesta 2.0.7
Copyright(c) 2009-2014 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Ext.define('Siesta.Harness.Browser.UI.AssertionGrid', {
    alias           : 'widget.assertiongrid',

    extend          : 'Ext.tree.Panel',
    
    mixins          : [
        'Siesta.Harness.Browser.UI.CanFillAssertionsStore'
    ],

//    requires            : [
//        'Siesta.Harness.Browser.Model.AssertionTreeStore',
//        'Siesta.Harness.Browser.UI.FilterableTreeView',
//        'Siesta.Harness.Browser.UI.TreeColumn'
//    ],

    cls                 : 'siesta-assertion-grid hide-simulated',

    enableColumnHide    : false,
    enableColumnMove    : false,
    enableColumnResize  : false,
    sortableColumns     : false,
    
    border              : false,
    forceFit            : true,
    minWidth            : 100,
    trackMouseOver      : false,
    autoScrollToBottom  : true,
    hideHeaders         : true,
    resultTpl           : null,
    rowLines            : false,
    isStandalone        : false,
    rootVisible         : false,
    collapseDirection   : 'left',
    test                : null,
    testListeners       : null,
    viewType            : 'filterabletreeview',

    initComponent : function() {
        var me = this;

        this.testListeners  = []
        
        if (!this.store) this.store = new Siesta.Harness.Browser.Model.AssertionTreeStore({

            proxy   : {
                type        : 'memory',
                reader      : { type: 'json' }
            },

            root    : {
                id          : '__ROOT__',
                expanded    : true,
                loaded      : true
            }
        })

        Ext.apply(this, {
            resultTpl   : new Ext.XTemplate(
                '<span class="assertion-text">{[this.getDescription(values.result)]}</span>{[this.getAnnotation(values)]}',
                {
                    getDescription : function (result) {
                        if (result instanceof Siesta.Result.Summary)
                            return result.description.join('<br>')
                        else
                            return result.isWarning ? 'WARN: ' + result.description : result.description
                    },
                    getAnnotation : function (data) {
                        var annotation = data.result.annotation
                        if (annotation) {
                            return '<pre title="' + annotation.replace(/"/g, "'") +'" style="margin-left:' + data.depth * 16 + 'px" class="tr-assert-row-annontation">' + Ext.String.htmlEncode(annotation) + '</pre>'
                        } else
                            return '';
                    }
                }
            ),

            columns     : [
                {
                    xtype           : 'assertiontreecolumn',
                    flex            : 1,
                    
                    dataIndex       : 'folderStatus',
                    renderer        : this.resultRenderer,
                    scope           : this,
                    
                    menuDisabled    : true,
                    sortable        : false
                } 
            ],

            viewConfig  : {
                enableTextSelection     : true,
                stripeRows              : false,
                disableSelection        : true,
                markDirty               : false,
                // Animation is disabled until: http://www.sencha.com/forum/showthread.php?265901-4.2.0-Animation-breaks-the-order-of-nodes-in-the-tree-view&p=974172
                // is resolved
                animate                 : false,
                trackOver               : false,

                // dummy store to be re-defined before showing each test
                store                   : new Ext.data.NodeStore({ fields : [], data : [] }),

                onAdd                   : function (store, records, index) {
                    this.refreshSize    = Ext.emptyFn;
                    var val             = Ext.tree.View.prototype.onAdd.apply(this, arguments);
                    this.refreshSize    = Ext.tree.View.prototype.refreshSize;
                    
                    // Scroll to bottom when test is running
                    if (!me.test.isFinished() && me.autoScrollToBottom) {
                        var el          = this.getEl().dom;
                        el.scrollTop    = el.scrollHeight;
                    }
                    
                    return val;
                },
                
                onUpdate                : function () {
                    this.refreshSize    = Ext.emptyFn;
                    var val             = Ext.tree.View.prototype.onUpdate.apply(this, arguments);
                    this.refreshSize    = Ext.tree.View.prototype.refreshSize;
                    
                    return val;
                },

                // this should be kept `false` - otherwise assertion grid goes crazy, see #477
                deferInitialRefresh     : false,
                
                getRowClass             : this.getRowClass
            }
        });

        this.callParent(arguments);
    },
    
    
    getRowClass : function (record, rowIndex, rowParams, store) {
        var result      = record.getResult()
        
        var cls         = ''
        
        // TODO switch to "instanceof"
        switch (result.meta.name) {
            case 'Siesta.Result.Diagnostic': 
                return 'tr-diagnostic-row ' + (result.isWarning ? 'tr-warning-row' : '');
        
            case 'Siesta.Result.Summary': 
                return 'tr-summary-row ' + (result.isFailed ? ' tr-summary-failure' : '');
        
            case 'Siesta.Result.SubTest':
                cls     = 'tr-subtest-row tr-subtest-row-' + record.get('folderStatus')
                
                if (result.test.specType == 'describe') cls += ' tr-subtest-row-describe'
                if (result.test.specType == 'it') cls += ' tr-subtest-row-it'
            
                return cls;
            
            case 'Siesta.Result.Assertion':
                cls     += 'tr-assertion-row '
            
                if (result.isWaitFor) 
                    cls += 'tr-waiting-row ' + (result.completed ? (result.passed ? 'tr-waiting-row-passed' : 'tr-assertion-row-failed tr-waiting-row-failed') : '')
                else if (result.isException) 
                    cls += result.isTodo ? 'tr-exception-todo-row' : 'tr-exception-row'
                else if (result.isTodo)
                    cls += result.passed ? 'tr-todo-row-passed' : 'tr-todo-row-failed'
                else
                    cls += result.passed ? 'tr-assertion-row-passed' : 'tr-assertion-row-failed'
                
                return cls
            default:
                throw "Unknown result class"
        }
    },    
    
    
    showTest : function (test, assertionsStore) {
        if (this.test) {
            Joose.A.each(this.testListeners, function (listener) { listener.remove() })
            
            this.testListeners  = []
        }
        
        this.test               = test
    
        this.testListeners      = [].concat(
            this.isStandalone ? [
                test.on('testupdate', this.onTestUpdate, this),
                test.on('testendbubbling', this.onEveryTestEnd, this)
            ] : []
        )
        
        Ext.suspendLayouts()

        if (assertionsStore)
            this.reconfigure(assertionsStore)
        else
            this.store.removeAll()

        Ext.resumeLayouts()
    },


    onTestUpdate : function (event, test, result, parentResult) {
        this.processNewResult(this.store, test, result, parentResult)
    },


    // is bubbling and thus triggered for all tests (including sub-tests)
    onEveryTestEnd : function (event, test) {
        this.processEveryTestEnd(this.store, test)
    },


    resultRenderer : function (value, metaData, record, rowIndex, colIndex, store) {
        return this.resultTpl.apply(record.data);
    },


    bindStore : function (treeStore, isInitial, prop) {
        this.callParent(arguments)

        this.store    = treeStore;

        if (treeStore && treeStore.nodeStore) {
            this.getView().dataSource   = treeStore.nodeStore
            // passing the tree store instance to the underlying `filterabletreeview`
            // the view will re-bind the tree store listeners
            this.getView().bindStore(treeStore, isInitial, prop)
        }
    },


    destroy : function () {
        Joose.A.each(this.testListeners, function (listener) { listener.remove() })

        this.testListeners  = []

        this.test           = null

        this.callParent(arguments)
    },

    
    clear : function () {
        this.getView().getEl().update('<div class="assertiongrid-initializing">' + Siesta.Resource('Siesta.Harness.Browser.UI.AssertionGrid', 'initializingText') + '</div>');
    }

})
