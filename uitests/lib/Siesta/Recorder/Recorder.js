/*

Siesta 2.0.7
Copyright(c) 2009-2014 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**

Low level class which records the events of the window it's attached to. It records basic mouse and key events,
but does not record scroll events and other browser type events. Since it's JS based, we cannot record
native dialog interactions, such as alert, print, confirm etc.

It tries to coalesce certain event patterns into higher order events (click, drag etc).

*/
Class('Siesta.Recorder.Recorder', {
    does : [
        JooseX.Observable
    ],

    has : {
        active              : null,
        
        extractor           : { required : true },

        // ignore events generated by Siesta (bypass in normal use, but for testing recorder we need it)
        ignoreSynthetic     : true,

        // The window this recorder is observing for events
        window              : null,

        // Fire a mouseidle event if mouse doesn't move for a while.
        idleTimeout         : 3000,

        eventsToRecord      : {
            init : function () {
                return [
                    "keydown",
                    "keypress",
                    "keyup",

                    "click",
                    "dblclick",
                    "contextmenu",
                    "mousedown",
                    "mouseup"
                ];
            }
        },

        // "raw" log of all dom events
        events              : Joose.I.Array,
        
        actions             : Joose.I.Array,
        actionsByEventId    : Joose.I.Object
    },

    
    methods : {

        initialize : function () {
            this.onUnload                   = this.onUnload.bind(this);
            this.onFrameLoad                = this.onFrameLoad.bind(this);
            this.onDomEvent                 = this.onDomEvent.bind(this);
            this.resetMouseMoveListener     = this.resetMouseMoveListener.bind(this);

            this.onBodyMouseMove            = this.throttleMouseMoveListener(this.onBodyMouseMove, this.idleTimeout, this);
        },

        
        isSamePoint : function (event1, event2) {
            return event1.x == event2.x && event1.y == event2.y;
        },

        
        clear          : function () {
            this.events     = []
            this.actions    = []
            
            this.fireEvent('clear', this)
        },

        
        // We monitor page loads so the recorder can add a waitForPageLoad action
        onUnload : function () {
            this.addAction(new Siesta.Recorder.Action({
                action          : 'waitForPageLoad'
            }))
        },

        // After frame has loaded, stop listening to old window and restart on new frame window
        onFrameLoad    : function (event) {
            this.stop();
            
            this.attach(event.target.contentWindow);
            
            this.start();
        },

        /*
         * Attaches the recorder to a Window object
         * @param {Window} windo The window to attach to.
         **/
        attach         : function (window) {
            this.stop()
            
            // clear only events, keep the actions
            this.events = []
            
            this.window = window;
        },

        /*
         * Starts recording events of the current Window object
         **/
        start          : function () {
            this.stop();
            
            this.active         = Date.now();
            this.onStart();
            this.fireEvent('start', this);
        },

        /*
         * Stops the recording of events
         **/
        stop           : function () {
            if (this.active) {
                this.active     = null;
                this.onStop();
                this.fireEvent('stop', this);
            }
        },

        
        getRecordedEvents : function () {
            return this.events;
        },
        
        
        getRecordedActions : function () {
            return this.actions
        },

        
        onDomEvent : function (e) {
            var target          = e.target
            
            // Never trust IE - target may be absent
            // Ignore events from played back test (if user plays test and records before it's stopped)
            if (!target || (this.ignoreSynthetic && e.synthetic)) return;
            
            var eventType       = e.type
            var isKeyEvent      = eventType.match(/^key/)
            
            var keys            = Siesta.Test.Simulate.KeyCodes().keys

            // Ignore special keys which are used only in combination with other keys
            if (isKeyEvent && (e.keyCode === keys.SHIFT || e.keyCode === keys.CTRL || e.keyCode === keys.ALT)) return;

            // `window` object to which the event target belongs
            var win             = target.ownerDocument.defaultView;
            
            // Case of nested iframe, not yet supported
            if (win !== this.window) return;
            
            var event           = Siesta.Recorder.Event.fromDomEvent(e)
            
//            // TODO review
//            this.resetMouseMoveListener();
////            this.onNewEventRecorded(e, event);
//            // eof review

            this.convertToAction(event)
            
            this.events.push(event)
            
            this.fireEvent('domevent', event)
        },
        
        
        eventToAction : function (event, actionName) {
            var type        = event.type
            
            if (!actionName)
                if (type == 'contextmenu')
                    actionName  = 'rightClick'
                else if (type.match(/^key/))
                    // convert all key events to type for now
                    actionName  = 'type'
                else
                    actionName  = type
            
            var config      = {
                action          : actionName,
                
                target          : this.extractor.getTargets(event),
                
                options         : event.options,
                
                sourceEvent     : event
            }
            
            return new Siesta.Recorder.Action(config)
        },
        
        
        recordAsAction : function (event, actionName) {
            var action      = this.eventToAction(event, actionName)
            
            if (action) this.addAction(action)
        },
        
        
        addAction : function (action) {
            this.actions.push(action)
            if (action.sourceEvent) this.actionsByEventId[ action.sourceEvent.id ] = action
            
            this.fireEvent('actionadd', action)
        },
        
        
        removeAction : function (actionToRemove) {
            var actions     = this.actions;
            
            for (var i = 0; i < actions.length; i++) {
                var action  = actions[ i ]
                
                if (action == actionToRemove) {
                    actions.splice(i, 1)
                    
                    if (action.sourceEvent) delete this.actionsByEventId[ action.sourceEvent.id ]
                    
                    this.fireEvent('actionremove', actionToRemove)
                    break;
                }
            }
        },
        
        
        removeActionByEventId : function (eventId) {
            this.removeAction(this.getActionByEventId(eventId))
        },
        

        removeActionByEvent : function (event) {
            this.removeAction(this.getActionByEventId(event.id))
        },
        
        
        getActionByEventId : function (eventId) {
            return this.actionsByEventId[ eventId ]
        },
        
        
        getLastAction : function () {
            return this.actions[ this.actions.length - 1 ]
        },
        

        // Method which tries to identify "composite" DOM interactions such as 'click/contextmenu' (3 events), double click
        // but also complex scenarios such as 'drag'
        convertToAction : function (event) {
            var events      = this.events,
                length      = events.length

            var type        = event.type
            
            if (type == 'keypress' || type == 'keyup' || type == 'keydown') {
                var KC              = Siesta.Test.Simulate.KeyCodes();
                var isSpecial       = KC.isSpecial(event.keyCode) || KC.isNav(event.keyCode) /*|| KC.isSpecial(tail.keyCode)*/;

                if (type == 'keypress' && !isSpecial || type == 'keyup' && isSpecial) {
                    var lastAction      = this.getLastAction()
                    
                    var text            = isSpecial ? '[' + KC.fromCharCode(event.charCode, true) + ']' : String.fromCharCode(event.charCode);
            
                    if (lastAction && lastAction.action === 'type') {
                        lastAction.value    += text
                        
                        this.fireEvent('actionupdate', lastAction)
                    } else {
                        this.addAction(new Siesta.Recorder.Action({
                            action          : 'type',
                            
                            value           : text,
                            
                            sourceEvent     : event,
                            options         : event.options
                        }))
                    }

                    return
                }
                
                // ignore 'keydown' events
                return
            }

            // if there's no already recorded events - there's nothing to coalsce
            if (!length) {
                this.recordAsAction(event)
                
                return
            }
                
            var tail        = events[ length - 1 ],
                tailPrev    = length >= 2 ? events[ length - 2 ] : null;
            
            var tailType    = tail.type

            // when user clicks on the <label> with "for" attribute 2 "click" events are triggered
            // just ignore the 2nd event and not record it as action
            // in FF, the 2nd "click" will have 0, 0 coordinates, so we have to disable `isSamePoint` extra sanity check
            if (type == 'click' && tailType == 'click' /*&& this.isSamePoint(event, tail)*/ && tail.target.getAttribute('for')) {
                return
            }

            if (type == 'dblclick') {
                // removing the last `click` action - one click event will still remain
                this.removeAction(this.getLastAction())
                
                this.getLastAction().action = 'dblclick'
                
                this.fireEvent('actionupdate', this.getLastAction())

                return
            }


            // if mousedown/up happened in a row in different points - this is considered to be a drag operation
            if (tailType == 'mousedown' && type == 'mouseup' && event.button == tail.button && !this.isSamePoint(event, tail)) {
                var lastAction      = this.getLastAction()
                
                // if we've recorded "moveCursorTo" in between mousedown / up (we don't record mousemove, so tail event will be still
                // mousedown) then we don't need to convert "mouseup" into drag
                if (lastAction.action != 'moveCursorTo') {
                    lastAction.action   = 'drag'
                    
                    lastAction.by       = [ event.x - tail.x, event.y - tail.y ]
                    
    //                var toTarget        = new Siesta.Recorder.Target({ targets : this.extractor.getTargets(event) })
    //                
    //                if (!toTarget.isTooGeneric()) lastAction.toTarget = toTarget
                    
                    this.fireEvent('actionupdate', lastAction)
                
                    return
                } else {
                    this.addAction(new Siesta.Recorder.Action({
                        action          : 'moveCursorTo',
                        
                        target          : this.extractor.getTargets(event),
                        
                        sourceEvent     : event,
                        options         : event.options
                    }))
                    
                    // the `mouseup` action will be recorded as the last `this.recordAsAction(event)` statement
                }
            }

            // In some situations the mouseup event may remove/overwrite the current element and no click will be triggered
            // so we need to catch drag operation on mouseup (see above) and ignore following "click" event
            if (type === 'click' && this.getLastAction() && this.getLastAction().action === 'drag') {
                return
            }

            if (tailPrev && (type === 'click' || type === 'contextmenu')) {
                if (
                    // Verify tail
                    tailType == 'mouseup' &&
                    event.button == tail.button &&
                    event.button == tailPrev.button &&
                    this.isSamePoint(event, tail) &&

                    // Verify previous tail
                    tailPrev.type == 'mousedown' &&
                    event.target == tail.target &&
                    event.target == tailPrev.target &&
                    this.isSamePoint(event, tailPrev)
                ) {
                    this.removeActionByEvent(tail)
                    this.removeActionByEvent(tailPrev)
                    
                    this.recordAsAction(event)
                    
                    return
                }
            }
            
            this.recordAsAction(event)
        },

        
        onStart : function () {
            var me      = this,
                win     = me.window,
                doc     = win.document,
                body    = doc.body;

            me.eventsToRecord.forEach(function (name) {
                doc.addEventListener(name, me.onDomEvent, true);
            });

            body.addEventListener('mousemove', this.onBodyMouseMove);
            $(body).bind('mouseleave', this.resetMouseMoveListener);

            win.frameElement && win.frameElement.addEventListener('load', this.onFrameLoad);
            win.addEventListener('unload', this.onUnload);
        },

        
        onStop : function () {
            var me      = this,
                win     = me.window,
                doc     = win.document,
                body    = doc.body;

            me.eventsToRecord.forEach(function (name) {
                doc.removeEventListener(name, me.onDomEvent, true);
            });
            
            body.removeEventListener('mousemove', this.onBodyMouseMove);
            $(body).unbind('mouseleave', this.resetMouseMoveListener);

            win.frameElement && win.frameElement.removeEventListener('load', this.onFrameLoad);
            win.removeEventListener('unload', this.onUnload);
            
            clearTimeout(this.mouseMoveDeferTimer);
        },
        

        resetMouseMoveListener : function () {
            clearTimeout(this.mouseMoveDeferTimer);
        },

        // This allows a user to indicate that the cursor should be move to a certain place
        // if mouse is still for a period (idleTimeout) of time.
        onBodyMouseMove        : function (e, t) {
            var me              = this;
            var now             = Date.now();
            var events          = me.events;
            var lastEvent       = events[ events.length - 1 ];

            if (!lastEvent || now - lastEvent.timestamp >= me.idleTimeout) {
                
                var mouseMoveEvent  = new Siesta.Recorder.Event.fromDomEvent(e)
                
                this.addAction(new Siesta.Recorder.Action({
                    action          : 'moveCursorTo',
                    
                    target          : this.extractor.getTargets(mouseMoveEvent),
                    
                    sourceEvent     : mouseMoveEvent,
                    
                    options         : mouseMoveEvent.options
                }))
            }
        },
        

        throttleMouseMoveListener : function (fn, threshhold, scope) {
            var last,
                me              = this;

            return function () {
                var context     = scope || this;
                var now         = Date.now(),
                    args        = arguments;

                if (last && now < last + threshhold) {
                    clearTimeout(me.mouseMoveDeferTimer);

                    me.mouseMoveDeferTimer = setTimeout(function () {
                        last    = now;
                        fn.apply(context, args);
                    }, threshhold);
                } else {
                    last        = now;
                }
            };
        }
    }
    // eof methods
});
