/*

Siesta 2.0.7
Copyright(c) 2009-2014 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Ext.define('Siesta.Recorder.Model.Action', {
    extend      : 'Ext.data.Model',
    
    fields      : [
    ],
    
    
    $action     : null,
    
    
    constructor : function (data) {
        if (!(data instanceof Siesta.Recorder.Action)) {
            data        = new Siesta.Recorder.Action(data)
        }

        // surprisingly the change in "data" variable will be reflected in "arguments"
        this.callParent(arguments)
        
        this.$action    = this.data = this.raw
    }
//    ,
    
    
//    setTargetByType : function (targetType, target) {
//        return this.$action.setTargetByType()
//    },


//    resetValues : function () {
//        this.$action.resetValues()
//        
//        this.afterEdit([ 'targets', 'value', '__offset__' ])
//    },
//
//    
//    clearTargetOffset : function () {
//        this.$action.clearTargetOffset()
//        
//        this.afterEdit([ 'targets' ])
//    },
//    
//    
//    setTargetOffset : function (value) {
//        this.$action.setTargetOffset(value)
//        
//        this.afterEdit([ '__offset__' ])
//    }
    
    
}, function () {
    var prototype   = this.prototype
    var fields      = prototype.fields
    
    Siesta.Recorder.Action.meta.getAttributes().each(function (attribute) {
        fields.add(new Ext.data.Field(attribute.name))
    })
    
    Joose.A.each([ 
        'getTargetOffset', 'isMouseAction', 'parseOffset', 'getTarget', 'getTargets', 'hasTarget', 'asStep', 'asCode'
    ], function (methodName) {
        prototype[ methodName ] = function () {
            return this.$action[ methodName ].apply(this.$action, arguments)
        }
    })
    
    Joose.O.each({
        clearTargetOffset       : [ 'target' ],
        setTargetOffset         : [ 'target' ],
        resetValues             : [ 'target', 'value' ],
        setAction               : [ 'action', 'target' ]
    }, function (fields, methodName) {
        prototype[ methodName ] = function () {
            var res     = this.$action[ methodName ].apply(this.$action, arguments)
            
            this.afterEdit(fields)
            
            return res
        }
    })
    
});
