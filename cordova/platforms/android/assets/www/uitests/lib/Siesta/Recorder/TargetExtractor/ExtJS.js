/*

Siesta 2.0.7
Copyright(c) 2009-2014 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**
@class Siesta.Recorder.TargetExtractor.ExtJS

To resolve a component, this is done in the following prio list

1. Custom (non-auto-gen Id, client provided)
2. Custom field property (see componentIdentifier). User provides button with "foo : 'savebutton'", possibly add CSS selector
3. Custom xtype, user provides subclassed button for example, possibly combined with CSS selector (composite query)
3. For components, add some intelligence, user generated CSS properties win over Ext CSS properties
3a. Buttons could look for iconCls, text etc
3b. Menuitems same thing
3c. Grids and lists provide nth-child to know which position in the list
3d. Find extra non Ext classes (they start with "x-"), which of course have been put there by client
4. CSS selector (class names, nodeName DIV etc)
5. Coordinates

The type of target, possible options:

- 'cq'      component query
- 'csq'     composite query


*/
Class('Siesta.Recorder.TargetExtractor.ExtJS', {
    isa     : Siesta.Recorder.TargetExtractor,
    
    does    : [
        Siesta.Recorder.TargetExtractor.Recognizer.Grid,
        Siesta.Recorder.TargetExtractor.Recognizer.BoundList,
        Siesta.Recorder.TargetExtractor.Recognizer.DatePicker,
        Siesta.Recorder.TargetExtractor.Recognizer.NumberField,
        Siesta.Recorder.TargetExtractor.Recognizer.View
    ],


    has : {
        // An accessor method to get the test Ext JS object
        Ext                     : null,
        
        allowNodeNamesForTargetNodes : false,
        
        ignoreIdRegExp          : function () {
            // Ext 4 vs  Ext 3
            return /^ext-gen\d+|^ext-comp-\d+/
        },

        // ?? probably meant to be used for DOM ids only.. Ext 4 vs  Ext 3
        compAutoGenIdRegExp     : /^ext-gen\d+|^ext-comp\d+/,

        // Tell Siesta how components can be identified uniquely,
        // to make sure generated selectors target only a single place in the DOM
        // (sorted in order of relevance)
        componentIdentifiers    : function () {
            return [
                'id',
                'itemId',
                'text',         // menu items, buttons
                'dataIndex',    // Column component
                'iconCls',      // button/menuitem
                'type',         // Panel header tools
                'name',         // form fields
                'title'         // identifying panels, tab panels headers
//                'cls',        // Cmp, TODO discuss
            ];
        },

        /* Ignore all generic classes which will generate unstable selectors */
        ignoreClasses           : function () {
            return [
                '-focus$',
                '-over$',               // never use hover-specific CSS classes
                '-selected$',
                '-active$',
                '-default$',
                
                'x-body',
                'x-box-item',
                'x-btn-wrap',
                'x-component',      // too generic
                'x-datepicker-cell',
                'x-fit-item',
                'x-form-field',     // too generic
                'x-form-empty-field',
                'x-form-required-field',
                'x-grid-cell-inner',  // we prefer "x-grid-cell"
                'x-grid-view',
                'x-grid-row-focused',
                'x-grid-resize-marker',
                'x-layout',
                'x-menu-item-link',
                'x-noicon',
                'x-resizable-overlay',
                'x-tab-noicon',
                'x-tab-default-noicon',
                'x-tab-default',
                'x-tree-icon',
                'x-trigger-index-',
                'x-unselectable',
                
                // Ext3 panel body classes
                'x-panel-bwrap',

                // Bryntum generic selectors
                'sch-gantt-terminal$',
                'sch-gantt-task-handle$',
                'sch-gantt-item',
                'sch-resizable-handle$',

                // In case someone left garbage in the DOM
                'null',
                'undefined'
            ];
        },

        // Table view is always in panel which seems more 'relevant'
        // headerContainer is rarely useful (remember though, a grid column is also a headercontainer)
        ignoreXTypes            : function () {
            return [
                'tableview', 
                'headercontainer[isColumn=undefined]' 
            ];
        },

        // These recognizer methods understand a bit about the Ext JS component implementation and can provide the most
        // stable CSS selectors for certain complex components, such as grid, menu, dataview etc.
        // Each method returns either nothing or an array of arrays containing CSS classes (on multiple levels in the DOM tree)
        recognizers             : Joose.I.Object
    },

    methods : {

//        initialize : function () {
//            var REC = Siesta.Recorder.TargetExtractor.Recognizer;
//
//            this.my.addRecognizer(new REC.Grid())
//            this.my.addRecognizer(new REC.View())
//            this.my.addRecognizer(new REC.BoundList())
//            this.my.addRecognizer(new REC.DatePicker())
//            this.my.addRecognizer(new REC.NumberField())
//
//            this.SUPERARG(arguments);
//        },
        
        
        getTargets : function (event) {
            var result      = this.SUPERARG(arguments)
            
            var target      = event.target;
            var component   = this.getComponentOfNode(target)
            
            // also try to find component/composite queries for the target
            if (component) {
                var componentQuery  = this.findComponentQueryFor(component)
                
                if (componentQuery) {
                    this.insertIntoTargets(result, {
                        type        : 'cq',
                        target      : componentQuery.query,
                        offset      : this.findOffset(event.x, event.y, (component.el || component.element).dom)
                    }, target)
                    
//                    result.unshift({
//                        type        : 'cq',
//                        target      : componentQuery.query,
//                        offset      : this.findOffset(event.x, event.y, component.getEl().dom)
//                    })
                    
                    var compositeQuery  = this.findCompositeQueryFor(target, componentQuery, componentQuery.target)
                    
                    if (compositeQuery)
                        this.insertIntoTargets(result, {
                            type        : 'csq',
                            target      : compositeQuery.query,
                            offset      : this.findOffset(event.x, event.y, compositeQuery.target)
                        }, target)
                    
                    
//                    result.unshift({
//                        type        : 'csq',
//                        target      : compositeQuery.query,
//                        offset      : this.findOffset(event.x, event.y, compositeQuery.target)
//                    })
                }
            }
            
            return result
            
            
//            var best, bestType, offset;
//            var target = event.target;
//            var targetDoc = target.ownerDocument;
//            var Ext = this.Ext(target);
//            var me = this;
//            var options = {
//                domId  : [],
//                css    : [],
//                cq     : [],
//                csq    : [],
//                xy     : [event.pageX, event.pageY],
//                offset : null
//            };
//
//            if (event.type === 'click') {
//                return options;
//            }

//            // Now, try to find some CSS selectors
//            var selectors = this.getCssSelectors(target);
//
//            if (selectors.length > 0) {
//                // Flatten
//                options.css = Array.prototype.concat.apply([], selectors)[ 0 ];
//
//                var jqOff = ($(target).is(options.css) ? $(target) : $(target).closest(options.css)).offset();
//
//                jqOff.left = Math.round(jqOff.left);
//                jqOff.top = Math.round(jqOff.top);
//                bestType = 'css';
//                best = options.css;
//                offset = jqOff && [ options.xy[ 0 ] - jqOff.left, options.xy[ 1 ] - jqOff.top]
//            }
//
//            // Now, try to find components
//            var components = this.getComponents(target);
//
//            if (components.length > 0) {
//                options.cq = me.getOptimalCQForComponent(components[ 0 ]);
//
//                // If the match isn't an id, try to add another level of scope
//                if (!options.cq.match('#') && components.length > 1) {
//                    var parentCQ = me.getOptimalParentCQ(components);
//
//                    // If id wasn't found, check one more level up
//                    // TODO might be a good idea
////                    if (!parentCQ.match('#') && components[ 2 ]) {
////                        var parent2CQ = me.getOptimalCQForComponent(components[ 2 ]);
////
////                        if (parent2CQ.match('#')) {
////                            parentCQ = parent2CQ;
////                        }
////                    }
//
//                    if (parentCQ) {
//                        options.cq = parentCQ + ' ' + options.cq;
//                    }
//                }
//
//                // Suggest a composite query
//                if (options.css && !components[ 0 ].el.is(best) && components[ 0 ].el.down(options.css)) {
//                    options.csq = options.cq + ' => ' + options.css;
//
//                    best = options.csq;
//                    bestType = 'csq';
//                } else {
//
//                    best = '>>' + options.cq;
//                    bestType = 'cq';
//                    offset = [ options.xy[ 0 ] - components[ 0 ].el.getX() , options.xy[ 1 ] - components[ 0 ].el.getY()]
//                }
//            }
//
//            var id = this.locateId(target);
//
//            // Checkbox configured with inputId : 'foo'
//            var containsStableId = components.length > 0 && Boolean(components[ 0 ].el.down('#' + id));
//
//            // If we're already using an Id, no point in looking for it. We already have a stable target option
//            // Also check if there is an id that's not a component on a closer level in the tree than the current best match
//            if (!best || !best.match('#') || containsStableId) {
//                // Try to find a stable id
//
//                if (id) {
//                    var cmp = Ext.getCmp(id);
//                    options.domId = '#' + id;
//
//                    // If the id match is a parent of the CQ result, add another level of scoping
//                    if (bestType === "cq" && cmp && cmp !== components[ 0 ] && cmp.el.contains(components[ 0 ].el)) {
//                        options.cq = options.domId + ' ' + options.cq;
//
//                        if (best === options.cq) {
//                            best = '>>' + options.cq;
//                        }
//                    } else if (containsStableId || bestType !== 'csq') {
//                        var found;
//
//                        // If the best we have is an #id, try to zoom in closer using the CSS context
//                        if (selectors[ 0 ].length > 0) {
//                            var targetNodeSelectors = selectors[ 0 ];
//
//                            for (var i = 0; i < targetNodeSelectors.length; i++) {
//
//                                // If found id contains the matched CSS, just append it
//                                if ($('#' + id, targetDoc).find(targetNodeSelectors[i]).length > 0) {
//                                    options.css = best = '#' + id + ' ' + targetNodeSelectors[i];
//                                    found = true;
//                                    break;
//                                }
//                            }
//                        }
//
//                        if (!found) {
//                            bestType = 'id';
//                            best = options.domId;
//                        }
//
//                        var jqOff = $(best, targetDoc).offset();
//                        jqOff.left = Math.round(jqOff.left);
//                        jqOff.top = Math.round(jqOff.top);
//
//                        offset = [ options.xy[ 0 ] - jqOff.left, options.xy[ 1 ] - jqOff.top]
//                    }
//
//                    // Should never hit this breakpoint
//                    if (id.match('ext-gen')) {
//                        debugger;
//                    }
//                }
//            }
//
//
//            options.actionTarget = best;
//            options.targetType = bestType;
//
//            if (!event.type.match('key')) {
//                options.offset = offset;
//            }
//
//            return options;
        },
        
        
        findCompositeQueryFor : function (node, componentQuery, component) {
            if (!componentQuery) {
                var component       = this.getComponentOfNode(node)
                
                if (component) {
                    componentQuery  = this.findComponentQueryFor(component)
                    
                    if (!componentQuery) return null
                    
                    // while finding the component query we've may actually switched to "parent matching" mode
                    // at changed the target component
                    component       = componentQuery.target
                }
            }
            
            var compEl              = (component.el || component.element)
            
            var compositeDomQuery   = this.findDomQueryFor(node, compEl.dom, 1)
            
            // if dom query contains an id - we don't need composite query at all?
            if (compositeDomQuery && compositeDomQuery.foundId) return null
            
            return compositeDomQuery 
                ? 
                    { query : componentQuery.query + ' => ' + compositeDomQuery.query, target : compositeDomQuery.target }
                :
                    null
        },
        
        
        getComponentOfNode : function (node) {
            var body        = node.ownerDocument.body
            var Ext         = this.Ext()
            
            while (node != body) {
                if (node.id && Ext.getCmp(node.id)) return Ext.getCmp(node.id)
                
                node        = node.parentNode
            }
            
            return null
        },
        
        
        ignoreDomId : function (id, node) {
            var Ext     = this.Ext();
            var prev    = this.SUPERARG(arguments)
            
            if (prev || !Ext) return prev
            
            // id of node in the dom can be formed from the id of the component this node belongs to
            // for example dom node `container-1019-innertCt` belonging to container-1019
            // such ids are considered auto-generated and should be ignored
            var comp    = this.getComponentOfNode(node)
            
            if (comp && this.hasAutoGeneratedId(comp) && id.indexOf(comp.id) > -1) return true
            
            return false
        },
        

        /*
         * Some component rarely offer extra specificity, like grid view which always sits inside a more
         * 'public' grid panel, need to ignore such components
         */
        ignoreComponent   : function (cmp) {
            var ignore = false;
            var Ext    = this.Ext();

            Joose.A.each(this.ignoreXTypes, function (xtype) {
                if (Ext.ComponentQuery.is(cmp, xtype)) {
                    ignore = true;
                    return false;
                }
            });

            return ignore;
        },        
        
        
        getComponentQuerySegmentForComponent : function (cmp) {
            var append      = '';
            
            // Figure out how best to identify this component, combobox lists, grid menus etc all need special treatment
            if (cmp.pickerField && cmp.pickerField.getPicker) {
                // Instead try to identify the owner picker field
                cmp         = cmp.pickerField;
                append      = '.getPicker()';
            }

            if (this.Ext().ComponentQuery.is(cmp, 'menu')) {
                // We only care about visible menus
                append      = '{isVisible()}';
            }

            var xtype       = cmp.xtype || cmp.xtypes[ 0 ]

            var dontNeedXType   = false
            var query           = ''

            for (var i = 0; i < this.componentIdentifiers.length; i++) {
                var attr    = this.componentIdentifiers[ i ]
                var value   = cmp[ attr ]

                if (
                    value && !(
                        (attr == 'id' && this.hasAutoGeneratedId(cmp)) ||
    
                        // Some Ext Components have an empty title
                        (attr == 'title' && value == '&#160;') ||
    
                        // Form fields can get a 'name' property auto generated, based on its own (or 2 lvls of parents) auto-gen id - ignore if true
                        (attr == 'name' && this.propertyIsAutoGenerated(cmp, 'name'))
                    )
                ) {
                    if (attr === 'id') {
                        // Easier to read and xtype is irrelevant
                        query           = '#' + value
                    } else {
                        query           = '[' + attr + '=' + value + ']'
                    }
                    
                    if (attr === 'id' || attr == 'itemId') dontNeedXType = true
                    
                    break
                }
            }
            
            if (!query && (xtype == 'component' || xtype == 'container' || xtype == 'toolbar' || this.ignoreComponent(cmp))) return null

            return (dontNeedXType ? query : xtype + query) + append
        },
        
        
        // Ext JS 4+: Form fields sometimes get their 'name' generated based on a parent id
        // property is considered to be auto-generated if it contains an id string and id is in turn auto-generated
        propertyIsAutoGenerated : function (comp, prop) {
            // Not relevant for Ext < 4
            if (!comp.up) return false;

            if (comp.autoGenId && comp[ prop ].indexOf(comp.id) >= 0) {
                return true;
            }

            var parentWithAutoId = comp.up('[autoGenId=true]');
            
            return Boolean(parentWithAutoId) && comp[ prop ].indexOf(parentWithAutoId.id) >= 0
        },
        
        
        hasAutoGeneratedId      : function (component) {
            // Ext3 ?
            if (this.compAutoGenIdRegExp.test(component.id)) {
                return true;
            }

            // even if `autoGenId` can be set to false, the id of the component can be formed from the id
            // if its parent, like "window-1019-header_hd" (id of window header), where "window-1019" is autogenerated id 
            // of parent component
            return component.autoGenId || this.propertyIsAutoGenerated(component, 'id');
        },
        
        
        processCssClasses : function (classes) {
            var Ext         = this.Ext()
            
            var prefix      = new RegExp('^' + Ext.baseCSSPrefix)
            
            var filtered    = classes.filter(function (cssClass) {
                return !prefix.test(cssClass)
            })
            
            // trying to find any non-Ext css class, if not found - return ext classes
            return filtered.length ? filtered : classes
        },
        
        
        findComponentQueryFor : function (comp, lookUpUntil) {
            var target              = comp
            var query               = []
            
            var foundGlobalId       = false
            // a size of array at which the last `itemId` segment was found
            // we want to include all `itemId` segments in the query, so later in the `for` loop
            // we start not from the last element, but from `last - foundLocalIdAt`
            var foundLocalIdAt      = 0
            
            var needToChangeTarget  = false
            var parentMatching      = false
            
            var current             = target
            
            while (current && current != lookUpUntil) {
                var segment     = this.getComponentQuerySegmentForComponent(current)
                
                // can't reliably identify the target component - no query at all
                if (current == comp && !segment)
                    if (this.allowParentMatching) {
                        // switching to "parent matching" mode in which we are looking for some parent of original dom
                        parentMatching      = true
                        needToChangeTarget  = true
                    } else
                        break
                
                if (segment) {
                    if (needToChangeTarget) {
                        target              = current
                        needToChangeTarget  = false
                    }
                    
                    query.unshift(segment)
                    
                    // no point in going further up, id is specific enough, return early
                    if (segment.match(/^#/)) {
                        foundGlobalId       = true
                        break
                    }
                    
                    if (segment.match(/^\[itemId=.*\]/)) foundLocalIdAt = query.length
                }
                
                do {
                    current         = current.ownerCt
                } while (current && current != lookUpUntil && this.ignoreComponent(current))
            }
            
            var resultQuery
            var hasUniqueMatch      = false
            
            for (var i = foundGlobalId ? 0 : query.length - foundLocalIdAt; i >= 0; i--) {
                var parts               = query.slice(i)
                var subQuery            = parts.join(' ')
                var matchingComponents  = this.doNonStandardComponentQuery(subQuery)
                
                // if only part of the query already matches only one component, we treat this as specific enough query
                // and not using other segments
                if (matchingComponents.length == 1) 
                    if (matchingComponents[ 0 ] == target) {
                        hasUniqueMatch  = true
                        resultQuery     = { query : subQuery, target : target, parts : parts }
                        break
                    } else
                        // found some query that matches a single component, not equal to original one - something went wrong
                        return null
                
                // at this point we are testing the whole query and it matches more then 1 component
                // in general such query is not specific enough, the only exception is when our component
                // is the 1st one in the results
                // in all other cases return null (below) 
                if (i == 0 && matchingComponents[ 0 ] == target) return { query : subQuery, target : target }
            }
            
            if (hasUniqueMatch) {
                var matchingParts       = resultQuery.parts
                
                var index               = 1
                
                while (index < matchingParts.length - 1) {
                    if (this.componentSegmentIsNotSignificant(matchingParts[ index ])) {
                        var strippedParts   = matchingParts.slice()
                        
                        strippedParts.splice(index, 1)
                        
                        var matchingNodes   = this.doNonStandardComponentQuery(subQuery)
                        
                        if (matchingNodes.length == 1) {
                            matchingParts.splice(index, 1)
                            // need to keep the index the same, so counter-adjust the following ++
                            index--
                        }
                    }
                    
                    index++
                }
            
                resultQuery.query       = parts.join(' ')
                delete resultQuery.parts
                
                return resultQuery
            }
            
            
            return null
        },
        

        componentSegmentIsNotSignificant : function () {
            return false
        },
        
        
        // Component Query with extensions - ".someMethod()" at the end
        doNonStandardComponentQuery : function (query, lookUpUntil) {
            var Ext             = this.Ext()
            var match           = /(.*?)(?:\.(\w+)\(\))?\s*$/.exec(query)
            
            var trimmedQuery    = match[ 1 ]
            var methodName      = match[ 2 ]
            
            var matchedComponents   = Ext.ComponentQuery.query(trimmedQuery)
            
            if (methodName)
                for (var i = 0; i < matchedComponents.length; i++)
                    if (Object.prototype.toString.call(matchedComponents[ i ][ methodName ]) == '[object Function]')
                        matchedComponents[ i ] = matchedComponents[ i ][ methodName ]()
            
            return matchedComponents
        },

        
        resolveTarget : function (target) {
            if (target.type == 'cq') {
                var component   = this.doNonStandardComponentQuery(target.target)[ 0 ]
                var el          = component && (component.el || component.element)
                
                return el && el.dom
            }
            
            if (target.type == 'csq') {
                var parts   = target.target.split('=>')
                
                var compEl  = this.resolveTarget({ type : 'cq', target : parts[ 0 ] })
                
                var el      = compEl && this.jquery(compEl).find(parts[ 1 ])[ 0 ]
                
                return el
            }
            
            return this.SUPERARG(arguments)
        },
        
        
        getFirstNonExtCssClass : function (node) {
            var prefix      = this.Ext().baseCSSPrefix;

            for (var i = 0; i < node.classList.length; i++) {
                var cls     = node.classList[ i ]
            
                if (cls.indexOf(prefix) != 0) return cls
            }

            return null;
        },
        
        
        getNthPosition : function (node, cls) {
            // find item that has the given `cls` class, starting from given `node` and up in the dom tree
            var itemInList  = node.className.match(new RegExp('\b' + this.regExpEscape(cls) + '\b')) ? node : this.jquery(node).closest('.' + cls)[ 0 ];

            // then find out, what index it has in it's parent node
            var array       = Array.prototype.slice.apply(itemInList.parentNode.childNodes);
            
            return array.indexOf(itemInList)
        }
        
        
        
        
        
        //=====================================================================================================================================
        
        
        


//        isNonExtCssClass : function (cls) {
//            return !/^x\-/.test(cls);
//        },
//
//        pluckCssClasses   : function (classes) {
//            var filtered = classes.filter(this.isNonExtCssClass, this);
//
//            if (filtered.length === 0) {
//                return classes;
//            }
//
//            return filtered;
//        },
//
//        // Differentiate between simple components, like textfield, button, menuitem, column
//        // from higher order widgets made up of several child
////        isCompositeWidget : function (cmp) {
////            return cmp.isContainer;
////        },
//
//
//        getOptimalParentCQ       : function (hierarchy) {
//            var parent = hierarchy[ 1 ];
//
//            // Skip tabbar, adds no relevance
//            if (parent && parent.xtype !== 'tabbar') {
//                return this.getOptimalCQForComponent(parent);
//            }
//
//            // TODO should walk up to find another possible parent on 2nd level or up
//
//            return null;
//        },
//
//        // Based on the componentIdentifiers, try to give the user unique components based
//        // on those attributes
////        getOptimalCQForComponent : function (cmp) {
////            var attr, append = '';
////            var me = this;
////
////            // Figure out how best to identify this component, combobox lists, grid menus etc all need special treatment
////            if (cmp.pickerField && cmp.pickerField.getPicker) {
////                // Instead try to identify the owner picker field
////                cmp = cmp.pickerField;
////                append = '.getPicker()';
////            }
////
////            if (cmp.is('menu')) {
////                // We only care about visible menus
////                append = '{isVisible()}';
////            }
////
////            var query = cmp.xtype || cmp.xtypes[ 0 ];
////
////            for (var i = 0; i < this.componentIdentifiers.length; i++) {
////                attr = this.componentIdentifiers[i];
////
////                if (
////                    cmp[attr] &&
////                    (attr !== 'id' || !me.hasAutoGeneratedId(cmp)) &&
////
////                    // Some Ext Components have an empty title
////                    (attr !== 'title' || cmp.title !== '&#160;') &&
////
////                    // Form fields can get a 'name' property auto generated, based on its own (or 2 lvls of parents) auto-gen id - ignore if true
////                    (attr !== 'name' || !me.propertyIsAutoGenerated(cmp, 'name'))
////                ) {
////                    if (attr === 'id' || attr === 'itemId') {
////                        // Easier to read and xtype is irrelevant
////                        query = '#' + cmp[attr];
////                    } else {
////                        query += '[' + attr + '=' + cmp[attr] + ']';
////                    }
////                    break;
////                }
////            }
////
////            return query + append;
////        },
//
//        locateId      : function (node) {
//            var Ext = this.Ext();
//
//            // Bubble up parent tree to find id a stable id provided by implementer, ignoring Component id's that are auto generated
//            while (node && node.nodeName.toUpperCase() !== this.lookUpUntil) {
//                if (node.id) {
//
//                    if (!Ext) return node.id;
//
//                    var cmp = Ext.getCmp(node.id);
//
//                    if (cmp && !this.hasAutoGeneratedId(cmp)) {
//                        return node.id;
//                    }
//
//                    // if we find an id, which is not a cmp - we'll need to first go up the DOM tree to see if there is a CMP with autogen id
//                    // which matches this id - not until then can we know if it's autogen
//                    if (!cmp && !node.id.match(this.compAutoGenIdRegExp)) {
//                        var p = node;
//                        var c;
//
//                        for (var i = 0; p && i < 10; i++) {
//                            p = p.parentNode;
//                            c = p && Ext.getCmp(p.id);
//
//                            if (c) {
//                                var hasAuto = this.hasAutoGeneratedId(c);
//
//                                if (!hasAuto) {
//                                    return node.id;
//                                }
//
//                                if (hasAuto && node.id.match(c.id)) {
//                                    return null;
//                                }
//                            }
//                        }
//
//                        // All is well
//                        return node.id;
//                    }
//                }
//                node = node.parentNode;
//            }
//        },
//
//        /*
//         * Looks for components registered with the ComponentManager
//         * */
////        getComponents : function (node) {
////            var Ext = this.Ext(node);
////            var components = [];
////
////            if (Ext && Ext.ComponentQuery) {
////                // Bubble up parent tree to find parent components
////                while (node && components.length < this.maxSuggestions && node.nodeName.toUpperCase() !== this.lookUpUntil) {
////                    if (node.id) {
////                        var cmp = Ext.getCmp(node.id);
////
////                        if (cmp && !this.ignoreComponent(cmp)) {
////                            components.push(cmp);
////                        }
////                    }
////                    node = node.parentNode;
////                }
////            }
////
////            return components;
////        },
//
//        getCssSelectors : function (node) {
//            var recognizers = this.my.recognizers;
//
//            for (var proc in recognizers) {
//                var target = recognizers[proc].call(this, node);
//
//                if (target) {
//                    return target;
//                }
//            }
//
//            // TODO we should prioritize and pick CSS class not matching Ext.baseCssPrefix (user CSS classes)
//
//            return this.SUPERARG(arguments);
//        },
//
//
//        
    }
    
//    ,
//    my : {
//        has : {
//            recognizers : Joose.I.Object
//        },
//
//        methods : {
//
//            addRecognizer : function (recognizer) {
//                this.recognizers[ recognizer.meta.name ] = recognizer.recognize;
//            }
//        }
//    }
});
