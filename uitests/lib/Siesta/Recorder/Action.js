/*

Siesta 2.0.7
Copyright(c) 2009-2014 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
!function () {
    
var ID      = 1

Class('Siesta.Recorder.Action', {
    
    has : {
        id                  : function () { return ID++ },
        action              : null,
        
        value               : null,
        
        /*
            Possible type of targets:
            - 'xy'      XY coordinates
            - 'css'     css selector
            - 'cq'      component query
            - 'csq'     composite query
            - 'user'    user-provided text
        */
        target              : null,
        
        toTarget            : null,
        by                  : null,
        
        options             : null,
        
        sourceEvent         : null
    },
    
    
    methods : {
        
        initialize : function () {
            var target      = this.target

            if (target && !(target instanceof Siesta.Recorder.Target)) {
                this.target = new Siesta.Recorder.Target({ targets : target })
            }
            
            var toTarget    = this.toTarget
            
            if (toTarget && !(toTarget instanceof Siesta.Recorder.Target)) 
                this.toTarget = new Siesta.Recorder.Target({ targets : toTarget })
        },
        
        
        setAction : function (newAction) {
            this.action     = newAction

            if (!this.hasTarget()) {
                this.target && this.target.clear()
                this.toTarget && this.toTarget.clear()
            }
        },
        
        
        hasTarget : function () {
            return this.isMouseAction()
        },
        
        
        getTarget : function (asInstance) {
            var target      = this.target
            
            return asInstance ? target : target && this.target.getTarget()
        },
        
        
        isMouseAction : function () {
            return (this.action || '').toLowerCase() in {
                click           : 1,
                contextmenu     : 1,
                dblclick        : 1,
                drag            : 1,
                mousedown       : 1,
                mouseup         : 1,
                movecursorby    : 1,
                movecursorto    : 1
            }
        },
        
        
        resetValues : function () {
            this.target         = null
            this.value          = null
            this.toTarget       = null
            this.by             = null
            this.options        = null
            this.sourceEvent    = null
        },
        
        
        parseOffset : function (offsetString) {
            var values  = offsetString.split(',');
    
            if (values.length < 2) return;
    
            if (!values[ 0 ].match('%')) {
                values[ 0 ] = parseInt(values[ 0 ], 10);
    
                if (isNaN(values[ 0 ])) return;
            }
    
            if (!values[ 1 ].match('%')) {
                values[ 1 ] = parseInt(values[ 1 ], 10);
    
                if (isNaN(values[ 1 ])) return;
            }
    
            return values;
        },
        
        
        clearTargetOffset : function () {
            this.setTargetOffset(null)
        },
    
    
        setTargetOffset : function (value) {
            var target  = this.target
            
            if (target) target.setOffset(value)
        },
    
    
        getTargetOffset : function () {
            var target  = this.target
            
            if (target) return target.getOffset()
        },
        
        
        objectToSource : function (obj) {
            var me = this;
    
            var result = Object.keys(obj).map(function (o) {
                if (obj[o] instanceof Array) {
                    return o + ' : [' + obj[o].join(', ') + ']';
                } else if (typeof obj[o] === 'object') {
                    return o + ' : ' + me.objectToSource(obj[o]);
                } else {
                    return o + ' : ' + (typeof (obj[o]) === 'string' ? '"' + obj[o] + '"' : obj[o]);
                }
            }).join(', ');
    
            return '{ ' + result + ' }';
        },
        
        
        asCode : function () {
            var step        = this.asStep()
            
            if (!step) return null
            
            return typeof step == 'function' ? step : this.objectToSource(step)
        },
        
        
        asStep : function () {
            var actionName      = this.action
            
            if (!actionName) return null
            
            var step            = { action : this.action };
            
            var target          = this.getTarget()
            var value           = this.value
            
            var hasTarget       = this.hasTarget()
            
            if (hasTarget) {
                if (!target) throw 'No target for action: ' + actionName
                
                step.target     = target.type == 'cq' ? '>>' + target.target: target.target
                
                if (target.offset) 
                    step.offset = target.offset.slice()
            }
    
    //        if (!actionName.match('waitFor') && target && typeof target !== "string" && !target.length) {
    //            throw 'Invalid target for ' + actionName + ' actionRecord: ' + target;
    //        }
    //
            if (this.options && !Joose.O.isEmpty(this.options)) {
                step.options    = this.options;
            }
    
            if (actionName.match(/^waitFor/)) {
                switch (actionName) {
                    case 'waitForFn':
                        // After this statement, t will be available in the evaled function below just as a regular local variable
                        var t   = this.test;
                        return { waitFor : eval("(function() {\n        " + value.replace(/\n/g, "\n        ") + "\n    })") };
    
                    case 'waitForMs':
                        var val = parseInt(value, 10);
    
                        return { waitFor : 'Ms', args : val };
    
                    default:
                        var obj = { waitFor : actionName.split('waitFor')[ 1 ], args : [] };
    
                        if (value) obj.args = value;
    
                        return obj;
                }
            } else {
                switch (actionName) {
                    case 'click':
                    case 'dblclick':
                    case 'contextmenu':
                    case 'mousedown':
                    case 'mouseup':
                    case 'moveCursorTo':
                        break
    
                    case 'moveCursor':
                        if (this.by) step.by     = this.by;
                        break;
    
                    case 'type':
                        step.text   = value;
                        delete step.target;
    
                        break;
    
                    case 'drag':
                        var toTarget    = this.toTarget
                        
                        if (toTarget && !toTarget.isTooGeneric()) {
                            step.to                             = toTarget.target;
                            if (toTarget.offset) step.toOffset  = toTarget.offset;
                            
                            break;
                        }
                        
                        step.by = this.by;
    
                        break;
    
                    case 'fn':
                        // After this statement, t will be available in the evaled function below just as a regular local variable
                        var t = this.test;
    
                        return eval("(function(next) {\n        " + value.replace(/\n/g, "\n        ") + "\n        next();\n    })");
    
                    default:
                        return null;
                }
            }
    
            return step;
        }
        
    }
});

}();