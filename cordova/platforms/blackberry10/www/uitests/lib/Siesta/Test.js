/*

Siesta 2.0.7
Copyright(c) 2009-2014 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**
@class Siesta.Test
@mixin Siesta.Test.More
@mixin Siesta.Test.Date 
@mixin Siesta.Test.Function
@mixin Siesta.Test.BDD 

`Siesta.Test` is a base testing class in Siesta hierarchy. Its not supposed to be created manually, instead, the harness will create it for you.

This file is a reference only, for a getting start guide and manual, please refer to <a href="#!/guide/siesta_getting_started">Getting Started Guide</a>.

Please note: Each test will be run in **its own**, completely **isolated** and **clean** global scope (created with the iframe). 
**There is no need to cleanup anything**.

SYNOPSIS
========

    StartTest(function(t) {
        t.diag("Sanity")
        
        t.ok($, 'jQuery is here')
        
        t.ok(Your.Project, 'My project is here')
        t.ok(Your.Project.Util, '.. indeed')
        
        setTimeout(function () {
        
            t.ok(true, "True is ok")
        
        }, 500)
    })    


*/

Class('Siesta.Test', {
    
    does        : [
        Siesta.Util.Role.CanFormatStrings,
        Siesta.Test.More,
        Siesta.Test.Date,
        Siesta.Test.Function,
        Siesta.Test.BDD,
        JooseX.Observable
    ],
    
    
    has        : {
        name                : null,
        
        /**
         * @property url The url of this test, as given to the {@link Siesta.Harness#start start} method. All subtests of some top-level test shares the same url.
         */
        url                 : { required : true },
        urlExtractRegex     : {
            is      : 'rwc',
            lazy    : function () {
                return new RegExp(this.url.replace(/([.*+?^${}()|[\]\/\\])/g, "\\$1") + ':(\\d+)')
            }
        },
        
        assertPlanned       : null,
        assertCount         : 0,
        
        // whether this test contains only "todo" assertions
        isTodo              : false,
        
        results             : {
            lazy    : function () {
                return new Siesta.Result.SubTest({ description  : this.name || 'Root', test : this })
            }
        },
        
        run                 : { required : true },
        startTestAnchor     : null,
        exceptionCatcher    : null,
        testErrorClass      : null,
        
        generation          : function () {
            return Math.random()
        },
        
        parent              : null,
        harness             : { required : true },
        
        /**
         * @cfg {Number} isReadyTimeout 
         * 
         * Timeout in milliseconds to wait for test start. Default value is 10000. See also {@link #isReady}  
         */
        isReadyTimeout      : 10000,

        // indicates that a test has thrown an exception (not related to failed assertions)
        failed              : false,
        failedException     : null, // stringified exception
        failedExceptionType : null, // type of exception
        
        // start and end date are stored as numbers (new Date() - 0)
        // this is to allow sharing date instances between different contexts
        startDate           : null,
        endDate             : null,
        lastActivityDate    : null,
        contentManager      : null,
        
        // the scope provider for the context of the test page
        scopeProvider       : null,
        // the context of the test page
        global              : { required : true },
        
        // the scope provider for the context of the test script
        // usually the same as the `scopeProvider`, but may be different in case of using `separateContext` option
        scriptScopeProvider : null,
        
        transparentEx       : false,
        
        needDone            : false,
        isDone              : false,
        
        defaultTimeout      : 15000,
        // a default timeout for sub tests
        subTestTimeout      : null,
        // a timeout of this particular test
        timeout             : null,
        
        timeoutsCount       : 1,
        timeoutIds          : Joose.I.Object,
        idsToIndex          : Joose.I.Object,
        waitTitles          : Joose.I.Object,
        
        
        // indicates that test function has completed the execution (test may be still running due to async)
        processed           : false,
        
        callback            : null,
        
        // Nbr of exceptions detected while running the test
        nbrExceptions       : 0,
        testEndReported     : false,
        
        // only used for testing itself, otherwise should be always `true`
        needToCleanup               : true,
        
        overrideSetTimeout          : false,
        
        originalSetTimeout          : { required : true },
        originalClearTimeout        : { required : true },
        
        sourceLineForAllAssertions  : false,
        
        $passCount                  : null,
        $failCount                  : null,
        
        actionableMethods           : {
            lazy        : 'buildActionableMethods'
        }
    },
    
    
    methods : {
        
        initialize : function () {
            // suppress bubblings of some events (JooseX.Observable does not provide better mechanism for that, yet)
            this.on('teststart', function (event) {
                if (this.parent) event.stopPropagation()
            })
            
            this.on('testfinalize', function (event) {
                if (this.parent) event.stopPropagation()
            })
            
            this.on('beforetestfinalize', function (event) {
                if (this.parent) event.stopPropagation()
            })
            
            this.on('beforetestfinalizeearly', function (event) {
                if (this.parent) event.stopPropagation()
            })
            
            this.subTestTimeout     = 2 * this.defaultTimeout
        },
        
        /**
         * This method allows you to delay the start of the test, for example for performing some asynchronous setup code (like login into an application).
         * Note, that you may want to use the {@link #setup} method instead, as it is a bit simpler to implement.
         * 
         * It is supposed to be overridden in a subclass of the Siesta.Test class and should return an object with two properties: "ready" and "reason"
         * ("reason" is only meaningful for the case where "ready : false"). The Test instance will poll this method and will only launch
         * the test after this method returns "ready : true". If waiting for this condition takes longer than {@link #isReadyTimeout}, the test
         * will be launched anyway, but a failing assertion will be added to it.
         * 
         * **Important** This method should always check the value returned by a `this.SUPER` call.
         * 
         * A typical example of using this method can be seen below:
         * 

    Class('My.Test.Class', {
        
        isa         : Siesta.Test.Browser,
            
        has         : {
            isCustomSetupDone           : false
        },
        
        override : {
            
            isReady : function () {
                var result = this.SUPERARG(arguments);
    
                if (!result.ready) return result;
    
                if (!this.isCustomSetupDone) return {
                    ready       : false,
                    reason      : "Waiting for `isCustomSetupDone` took too long - something wrong?"
                }
                
                return {
                    ready       : true
                }
            },
    
            
            start : function () {
                var me      = this;
                
                Ext.Ajax.request({
                    url     : 'do_login.php',
                    
                    params  : { ... },
                    
                    success : function () {
                        me.isCustomSetupDone    = true
                    }
                })
                
                this.SUPERARG(arguments)
            }
        },
        
        ....
    })
    
         * 
         * @return {Object} Object with properties `{ ready : true/false, reason : 'description' }`
         */
        isReady: function() {
            var R = Siesta.Resource('Siesta.Test');

            // this should allow us to wait until the presense of "run" function
            // it will become available after call to StartTest method
            // which some users may call asynchronously, after some delay
            // see https://www.assembla.com/spaces/bryntum/tickets/379
            // in this case test can not be configured using object as 1st argument for StartTest
            this.run    = this.run || this.getStartTestAnchor().args && this.getStartTestAnchor().args[ 0 ]
            
            return {
                ready   : this.typeOf(this.run) == 'Function',
                reason  : R.get('noCodeProvidedToTest')
            }
        },
        
        
        isFromTheSameGeneration : function (test2) {
            return this.generation == test2.generation
        },
        

        toString : function() {
            return this.url
        },
        
        
        // deprecated
        plan : function (value) {
            if (this.assertPlanned != null) throw new Error("Test plan can't be changed")
            
            this.assertPlanned = value
        },
        
        
        addResult : function (result) {
            var isAssertion = result instanceof Siesta.Result.Assertion
            
            if (isAssertion) result.isTodo = this.isTodo
            
            // only allow to add diagnostic results and todo results after the end of test
            // and only if "needDone" is enabled
            if (isAssertion && (this.isDone || this.isFinished()) && !result.isTodo) {
                if (!this.testEndReported) {
                    this.testEndReported = true
                    var R = Siesta.Resource('Siesta.Test');

                    this.fail(R.get('addingAssertionsAfterDone'))
                }
            }

            if (isAssertion && !result.index) {
                result.index = ++this.assertCount
            }

            this.getResults().push(result)
            
            // clear the cache
            this.$passCount     = this.$failCount   = null
            
            /**
             * This event is fired when an individual test case receives a new result (assertion or diagnostic message).
             * 
             * This event bubbles up to the {@link Siesta.Harness harness}, so you can observe it on the harness as well.
             * 
             * @event testupdate
             * @member Siesta.Test
             * @param {JooseX.Observable.Event} event The event instance
             * @param {Siesta.Test} test The test instance that just has started
             * @param {Siesta.Result} result The new result. Instance of Siesta.Result.Assertion or Siesta.Result.Diagnostic classes
             */
            this.fireEvent('testupdate', this, result, this.getResults())

            this.lastActivityDate = new Date();
        },
        

        /**
         * This method output the diagnostic message.  
         * @param {String} desc The text of diagnostic message
         */
        diag : function (desc) {
            this.addResult(new Siesta.Result.Diagnostic({
                description : desc
            }))
        },
        
        
        /**
         * This method add the passed assertion to this test.
         * 
         * @param {String} desc The description of the assertion
         * @param {String/Object} annotation The string with additional description how exactly this assertion passes. Will be shown with monospace font.
         * Can be also an object with the following properties:
         * @param {String} annotation.annotation The actual annotation text
         * @param {String} annotation.descTpl The template for the default description text. Will be used if user did not provide any description for
         * assertion. Template can contain variables in braces. The values for variables are taken as properties of `annotation` parameters with the same name:
         * 

    this.pass(desc, {
        descTpl         : '{value1} sounds like {value2}',
        value1          : '1',
        value2          : 'one
    })

         * 
         */
        pass : function (desc, annotation, result) {
            if (annotation && this.typeOf(annotation) != 'String') {
                // create a default assertion description
                if (!desc && annotation.descTpl) desc = this.formatString(annotation.descTpl, annotation)
                
                // actual annotation
                annotation          = annotation.annotation
            }
            
            if (result) {
                result.passed       = true
                result.description  = desc || ''
                result.annotation   = annotation
            }
            
            this.addResult(result || new Siesta.Result.Assertion({
                passed          : true,
                
                annotation      : annotation,
                description     : desc || '',
                sourceLine      : (result && result.sourceLine) || (annotation && annotation.sourceLine) || this.sourceLineForAllAssertions && this.getSourceLine() || null
            }))
        },
        
        
        /**
         * This method returns a result of `Object.prototype.toString` applied to the passed argument. The `[object` and trailing `]` are trimmed. 
         * 
         * @param {Mixed} object
         * @return {String} The name of the "type" for this object.
         */
        typeOf : function (object) {
            return Object.prototype.toString.call(object).replace(/^\[object /, '').replace(/\]$/, '')
        },
        
        /**
         * This method add the failed assertion to this test.
         * 
         * @param {String} desc The description of the assertion
         * @param {String/Object} annotation The additional description how exactly this assertion fails. Will be shown with monospace font.
         * 
         * Can be either string or an object with the following properties. In the latter case a string will be constructed from the properties of the object.
         * 
         * - `assertionName` - the name of assertion, will be shown in the 1st line, along with originating source line (in FF and Chrome only)
         * - `got` - an arbitrary JavaScript object, when provided will be shown on the next line
         * - `need` - an arbitrary JavaScript object, when provided will be shown on the next line
         * - `gotDesc` - a prompt for "got", default value is "Got", but can be for example: "We have" 
         * - `needDesc` - a prompt for "need", default value is "Need", but can be for example: "We need"
         * - `annotation` - A text to append on the last line, can contain some additional explanations
         * 
         *  The "got" and "need" values will be stringified to the "not quite JSON" notation. Notably the points of circular references will be 
         *  marked with `[Circular]` marks and the values at 4th (and following) level of depth will be marked with triple points: `[ [ [ ... ] ] ]`  
         */
        fail : function (desc, annotation, result) {
            var sourceLine          = (result && result.sourceLine) || (annotation && annotation.sourceLine) || this.getSourceLine()
            var assertionName       = '';

            if (annotation && this.typeOf(annotation) != 'String') {
                if (!desc && annotation.descTpl) desc = this.formatString(annotation.descTpl, annotation)
                
                var strings             = []
                
                var params              = annotation
                var hasGot              = params.hasOwnProperty('got')
                var hasNeed             = params.hasOwnProperty('need')
                var gotDesc             = params.gotDesc || 'Got'
                var needDesc            = params.needDesc || 'Need'

                assertionName           = params.assertionName
                annotation              = params.annotation

                if (!params.ownTextOnly && (assertionName || sourceLine)) strings.push(
                    'Failed assertion ' + (assertionName ? '`' + assertionName + '` ' : '') + this.formatSourceLine(sourceLine)
                )
                
                if (hasGot && hasNeed) {
                    var max         = Math.max(gotDesc.length, needDesc.length)
                    
                    gotDesc         = this.appendSpaces(gotDesc, max - gotDesc.length + 1)
                    needDesc        = this.appendSpaces(needDesc, max - needDesc.length + 1)
                }
                
                if (hasGot)     strings.push(gotDesc   + ': ' + Siesta.Util.Serializer.stringify(params.got))
                if (hasNeed)    strings.push(needDesc  + ': ' + Siesta.Util.Serializer.stringify(params.need))
                
                if (annotation) strings.push(annotation)
                
                annotation      = strings.join('\n')
            }
            
            if (result) {
                // Failing a pending waitFor operation
                result.name         = assertionName;
                result.passed       = false;
                result.annotation   = annotation;
                result.description  = desc;
            }
            
            this.addResult(result || new Siesta.Result.Assertion({
                name        : assertionName,
                passed      : false,
                sourceLine  : sourceLine,
            
                annotation  : annotation,
                description : desc
            }))

            if (!this.isTodo) {
                if (this.harness.debuggerOnFail) {
                    eval("debugger");
                }
    
                if (this.harness.breakOnFail) {
                    var R = Siesta.Resource('Siesta.Test');
    
                    this.finalize(true);
                    throw R.get('testFailedAndAborted');
                }
            }
        },

        
        getSource : function () {
            return this.contentManager.getContentOf(this.url)
        },
        
        
        getSourceLine : function () {
            try {
                throw new Error()
            } catch (e) {
                if (e.stack) {
                    var match       = e.stack.match(this.urlExtractRegex())
                    
                    if (match) return match[ 1 ]
                }
                
                return null
            }
        },
        
        
        getStartTestAnchor : function () {
            return this.startTestAnchor
        },
        
        
        getExceptionCatcher : function () {
            return this.exceptionCatcher
        },
        
        
        getTestErrorClass : function () {
            return this.testErrorClass
        },

        
        processCallbackFromTest : function (callback, args, scope) {
            var me      = this

            if (!callback) return true;

            if (this.transparentEx) {
                callback.apply(scope || this.global, args || [])
            } else {
                var e = this.getExceptionCatcher()(function(){
                    callback.apply(scope || me.global, args || [])
                })
            
                if (e) {
                    this.failWithException(e)
                    
                    // flow should be interrupted - exception detected
                    return false
                }
            }
            
            // flow can be continued
            return true
        },

        
        getStackTrace : function (e) {
            if (Object(e) !== e)    return null
            if (!e.stack)           return null
            
            var text            = e.stack + '';
            var isFirefox       = /^@/.test(text)
            var lines           = text.split('\n')
            var R               = Siesta.Resource('Siesta.Test');

            var result          = []
            var match
            
            for (var i = 0; i < lines.length; i++) {
                if (!lines[ i ]) continue
                
                if (!i) {
                    if (isFirefox) 
                        result.push(e + '')
                    else {
                        result.push(lines[ i ])
                        continue;
                    }
                }
            
                if (isFirefox) {
                    match       = /@(.*?):(\d+)/.exec(lines[ i ]);
                    
                    // the format of stack trace in Firefox has changed, 080_exception_parsing should fail
                    if (!match) return null
                    
                    result.push('    ' + R.get('atLine') + ' ' + match[ 2 ] + ' ' + R.get('of') + ' ' + match[ 1 ])
                } else {
                    match       = /\s*at\s(.*?):(\d+):(\d+)/.exec(lines[ i ]);
                    
                    // the format of stack trace in Chrome has changed, 080_exception_parsing should fail
                    if (!match) return null
                    
                    result.push('    ' + R.get('atLine') + ' ' + match[ 2 ] + ', ' + R.get('character') + ' ' + match[ 3 ] + ', ' + R.get('of') + ' ' + match[ 1 ])
                }
            }
                
            if (!result.length) return null
            
            return result
        },
        
        
        formatSourceLine : function (sourceLine) {
            var R               = Siesta.Resource('Siesta.Test');

            return sourceLine ? (R.get('atLine') + ' ' + sourceLine + ' ' + R.get('of') + ' ' + this.url) : ''
        },
        
        
        appendSpaces : function (str, num) {
            var spaces      = ''
            
            while (num--) spaces += ' '
            
            return str + spaces
        },
        
        
        eachAssertion : function (func, scope) {
            scope       = scope || this
            
            this.getResults().each(function (result) {
                if (result instanceof Siesta.Result.Assertion) func.call(scope, result)
            })
        },
        
        
        eachSubTest : function (func, scope) {
            scope       = scope || this
            
            this.getResults().each(function (result) {
                if (result instanceof Siesta.Result.SubTest) func.call(scope, result.test)
            })
        },
        
        
        eachChildTest : function (func, scope) {
            scope       = scope || this
            
            this.getResults().eachChild(function (result) {
                if (result instanceof Siesta.Result.SubTest) func.call(scope, result.test)
            })
        },
        
        
        countKeys : function (object) {
            var counter = 0
            
            Joose.O.eachOwn(object, function () {
                counter++
            })
            
            return counter
        },
        
        
        /**
         * This method performs a deep comparison of the passed JSON objects. Objects must not contain cyclic references.
         * You can use this method in your own assertions.
         * 
         * @param {Mixed} obj1 The 1st object to compare
         * @param {Mixed} obj2 The 2nd object to compare
         * @param {Boolean} strict When passed the `true` value, the comparison of the primitive values will be performed with the 
         * `===` operator (so [ 1 ] and [ "1" ] object will be different). Additionally, when this flag is set to `true`, then
         * when comparing Function, RegExp and Date instances, additional check that objects contains the same set of own properties ("hasOwnProperty")
         * will be performed. 
         * @param {Boolean} onlyPrimitives When set to `true`, the function will not recurse into composite objects (like [] or {}) and will just report that
         * objects are different. Use this mode when you are only interesetd in comparison of primitive values (numbers, strings, etc).
         * @param {Boolean} asObjects When set to `true`, the function will compare various special Object instances, like Functions, RegExp etc,
         * by comparison of their properties only and not taking the anything else into account.
         * @return {Boolean} `true` if the passed objects are equal
         */
        compareObjects : function (obj1, obj2, strict, onlyPrimitives, asObjects) {
            var obj1IsPlaceholder       = Joose.O.isInstance(obj1) && obj1.meta.does(Siesta.Test.Role.Placeholder)
            var obj2IsPlaceholder       = Joose.O.isInstance(obj2) && obj2.meta.does(Siesta.Test.Role.Placeholder)
            
            if (strict) {
                if (obj1 === obj2) return true
            } else 
                if (obj1 == obj2) return true
                
            if (obj1IsPlaceholder && obj2IsPlaceholder)
                return obj1.equalsTo(obj2)
            else if (obj2IsPlaceholder)
                return obj2.equalsTo(obj1)
            else if (obj1IsPlaceholder)
                return obj1.equalsTo(obj2)
                
            if (onlyPrimitives) return false
            
            var type1 = this.typeOf(obj1)
            var type2 = this.typeOf(obj2)
            
            if (type1 != type2) return false
            
            var me = this
                
            if (type1 == 'Object' || asObjects)
                if (this.countKeys(obj1) != this.countKeys(obj2)) 
                    return false
                else {
                    var res = Joose.O.eachOwn(obj1, function (value, name) {
                        
                        if (!me.compareObjects(value, obj2[ name ], strict)) return false
                    })
                    
                    return res === false ? false : true
                }
                
            if (type1 == 'Array')
                if (obj1.length != obj2.length) 
                    return false
                else {
                    for (var i = 0; i < obj1.length; i++)
                        if (!this.compareObjects(obj1[ i ], obj2[ i ], strict)) return false
                    
                    return true
                }
                
            if (type1 == 'Function') 
                return obj1.toString() == obj2.toString() && (!strict || this.compareObjects(obj1, obj2, strict, false, true))
            
            if (type1 == 'RegExp') 
                return obj1.source == obj2.source && obj1.global == obj2.global && obj1.ignoreCase == obj2.ignoreCase 
                    && obj1.multiline == obj2.multiline && (!strict || this.compareObjects(obj1, obj2, strict, false, true))
                
            if (type1 == 'Date') return !Boolean(obj1 - obj2) && (!strict || this.compareObjects(obj1, obj2, strict, false, true))
            
            return false
        }, 
        
        
        /**
         * This assertion passes when the supplied `value` evalutes to `true` and fails otherwise.
         *  
         * @param {Mixed} value The value, indicating wheter assertions passes or fails
         * @param {String} desc The description of the assertion
         */
        ok : function (value, desc) {
            var R               = Siesta.Resource('Siesta.Test');

            if (value) 
                this.pass(desc, {
                    descTpl             : R.get('isTruthy'),
                    value               : value
                })
            else 
                this.fail(desc, {
                    assertionName       : 'ok', 
                    got                 : value, 
                    annotation          : R.get('needTruthy')
                })
        },
        
        
        notok : function () {
            this.notOk.apply(this, arguments)
        },
        
        /**
         * This assertion passes when the supplied `value` evalutes to `false` and fails otherwise.
         * 
         * It has a synonym - `notok`.
         *  
         * @param {Mixed} value The value, indicating wheter assertions passes or fails
         * @param {String} desc The description of the assertion
         */
        notOk : function (value, desc) {
            var R               = Siesta.Resource('Siesta.Test');

            if (!value)
                this.pass(desc, {
                    descTpl             : R.get('isFalsy'),
                    value               : value
                })
            else 
                this.fail(desc, {
                    assertionName       : 'notOk', 
                    got                 : value, 
                    annotation          : R.get('needFalsy')
                })
        },
        
        
        /**
         * This assertion passes when the comparison of 1st and 2nd arguments with `==` operator returns true and fails otherwise.
         * 
         * As a special case, one or both arguments can be *placeholders*, generated with method {@link #any}. 
         * 
         * @param {Mixed} got The value "we have" - will be shown as "Got:" in case of failure
         * @param {Mixed} expected The value "we expect" - will be shown as "Need:" in case of failure
         * @param {String} desc The description of the assertion
         */
        is : function (got, expected, desc) {
            var R               = Siesta.Resource('Siesta.Test');

            if (expected && got instanceof this.global.Date) {
                this.isDateEqual(got, expected, desc);
            } else if (this.compareObjects(got, expected, false, true))
                this.pass(desc, {
                    descTpl             : R.get('isEqualTo'),
                    got                 : got,
                    expected            : expected
                })
            else
                this.fail(desc, {
                    assertionName       : 'is', 
                    got                 : got, 
                    need                : expected 
                })
        },
        

        
        isnot : function () {
            this.isNot.apply(this, arguments)
        },

        isnt : function () {
            this.isNot.apply(this, arguments)
        },
        
        
        /**
         * This assertion passes when the comparison of 1st and 2nd arguments with `!=` operator returns true and fails otherwise.
         * It has synonyms - `isnot` and `isnt`.
         * 
         * As a special case, one or both arguments can be instance of {@link Siesta.Test.BDD.Placeholder} class, generated with method {@link #any}.
         * 
         * @param {Mixed} got The value "we have" - will be shown as "Got:" in case of failure
         * @param {Mixed} expected The value "we expect" - will be shown as "Need:" in case of failure
         * @param {String} desc The description of the assertion
         */
        isNot : function (got, expected, desc) {
            var R               = Siesta.Resource('Siesta.Test');

            if (!this.compareObjects(got, expected, false, true))
                this.pass(desc, {
                    descTpl             : R.get('isNotEqualTo'),
                    got                 : got,
                    expected            : expected
                })
            else
                this.fail(desc, {
                    assertionName       : 'isnt', 
                    got                 : got, 
                    need                : expected,
                    needDesc            : R.get('needNot')
                })
        },
        

        /**
         * This assertion passes when the comparison of 1st and 2nd arguments with `===` operator returns true and fails otherwise.
         * 
         * As a special case, one or both arguments can be instance of {@link Siesta.Test.BDD.Placeholder} class, generated with method {@link #any}.
         * 
         * @param {Mixed} got The value "we have" - will be shown as "Got:" in case of failure
         * @param {Mixed} expected The value "we expect" - will be shown as "Need:" in case of failure
         * @param {String} desc The description of the assertion
         */
        isStrict : function (got, expected, desc) {
            var R               = Siesta.Resource('Siesta.Test');

            if (this.compareObjects(got, expected, true, true))
                this.pass(desc, {
                    descTpl             : R.get('isStrictlyEqual'),
                    got                 : got,
                    expected            : expected
                })
            else
                this.fail(desc, {
                    assertionName       : 'isStrict', 
                    got                 : got, 
                    need                : expected,
                    needDesc            : R.get('needStrictly')
                })
        },

        
        isntStrict : function () {
            this.isNotStrict.apply(this, arguments)
        },
        
        /**
         * This assertion passes when the comparison of 1st and 2nd arguments with `!==` operator returns true and fails otherwise.
         * It has synonyms - `isntStrict`.
         * 
         * As a special case, one or both arguments can be instance of {@link Siesta.Test.BDD.Placeholder} class, generated with method {@link #any}.
         * 
         * @param {Mixed} got The value "we have" - will be shown as "Got:" in case of failure
         * @param {Mixed} expected The value "we expect" - will be shown as "Need:" in case of failure
         * @param {String} desc The description of the assertion
         */
        isNotStrict : function (got, expected, desc) {
            var R               = Siesta.Resource('Siesta.Test');

            if (!this.compareObjects(got, expected, true, true))
                this.pass(desc, {
                    descTpl             : R.get('isStrictlyNotEqual'),
                    got                 : got,
                    expected            : expected
                })
            else
                this.fail(desc, {
                    assertionName       : 'isntStrict', 
                    got                 : got, 
                    need                : expected,
                    needDesc            : R.get('needStrictlyNot')
                })
        },
        
        
        /**
         * This method starts the "asynchronous frame". The test will wait for all asynchronous frames to complete before it will finalize.
         * The frame can be finished with the {@link #endWait} call. Unlike the {@link #beginAsync}, this method requires you to provide
         * the unique id for the asynchronous frame. 
         * 
         * For example:
         * 
         *      t.wait("require")
         *      
         *      Ext.require('Some.Class', function () {
         *      
         *          t.ok(Some.Class, 'Some class was loaded')
         *          
         *          t.endWait("require")
         *      })
         * 
         * 
         * @param {String} title The unique id for the asynchronous frame.
         * @param {String} howLong The maximum time (in ms) to wait until force the finalization of this async frame. Optional. Default time is 15000 ms.
         */
        wait : function (title, howLong) {
            var R               = Siesta.Resource('Siesta.Test');

            if (this.waitTitles.hasOwnProperty(title)) throw new Error(R.get('alreadyWaiting')+ " [" + title + "]")
            
            return this.waitTitles[ title ] = this.beginAsync(howLong)
        },
        
        
        /**
         * This method finalize the "asynchronous frame" started with {@link #wait}.
         * 
         * @param {String} title The id of frame to finalize, which was previously passed to {@link #wait} method
         */
        endWait : function (title) {
            var R               = Siesta.Resource('Siesta.Test');

            if (!this.waitTitles.hasOwnProperty(title)) throw new Error(R.get('noOngoingWait') + " [" + title + "]")
            
            this.endAsync(this.waitTitles[ title ])
            
            delete this.waitTitles[ title ]
        },
        
        
        
        /**
         * This method starts the "asynchronous frame". The test will wait for all asynchronous frames to complete before it will finalize.
         * The frame should be finished with the {@link #endAsync} call within the provided `time`, otherwise a failure will be reported. 
         * 
         * For example:
         * 
         *      var async = t.beginAsync()
         *      
         *      Ext.require('Some.Class', function () {
         *      
         *          t.ok(Some.Class, 'Some class was loaded')
         *          
         *          t.endAsync(async)
         *      })
         * 
         * 
         * @param {Number} time The maximum time (in ms) to wait until force the finalization of this async frame. Optional. Default time is 15000 ms.
         * @param {Function} errback Optional. The function to call in case the call to {@link #endAsync} was not detected withing `time`. If function
         * will return any "truthy" value, the failure will not be reported (you can report own failure with this errback).
         *  
         * @return {Object} The frame object, which can be used in {@link #endAsync} call
         */
        beginAsync : function (time, errback) {
            time                        = time || this.defaultTimeout

            var R                       = Siesta.Resource('Siesta.Test');
            var me                      = this
            var originalSetTimeout      = this.originalSetTimeout
            
            var index                   = this.timeoutsCount++
            
            // in NodeJS `setTimeout` returns an object and not a simple ID, so we try hard to store that object under unique index
            // also using `setTimeout` from the scope of test - as timeouts in different scopes in browsers are mis-synchronized
            // can't just use `this.originalSetTimeout` because of scoping issues
            var timeoutId               = originalSetTimeout(function () {
                
                if (me.hasAsyncFrame(index)) {
                    if (!errback || !errback.call(me, me)) me.fail(R.get('noMatchingEndAsync') + ' ' + time + ' ' + Siesta.Resource('Siesta.Test.More', 'ms'))
                    
                    me.endAsync(index)
                }
            }, time)
            
            this.timeoutIds[ index ]    = timeoutId
            
            return index
        },
        
        
        hasAsyncFrame : function (index) {
            return this.timeoutIds.hasOwnProperty(index)
        },
        
        
        /**
         * This method finalize the "asynchronous frame" started with {@link #beginAsync}.
         * 
         * @param {Object} frame The frame to finalize (returned by {@link #beginAsync} method
         */
        endAsync : function (index) {
            var originalSetTimeout      = this.originalSetTimeout
            var originalClearTimeout    = this.originalClearTimeout || this.global.clearTimeout
            var counter = 0
            var R                       = Siesta.Resource('Siesta.Test');

            if (index == null) Joose.O.each(this.timeoutIds, function (timeoutId, indx) {
                index = indx
                if (counter++) throw new Error(R.get('endAsyncMisuse'))
            })
            
            var timeoutId               = this.timeoutIds[ index ]
            
            // need to call in this way for IE < 9
            originalClearTimeout(timeoutId)
            delete this.timeoutIds[ index ]
            
            var me = this
            
            if (this.processed && !this.isFinished())
                // to allow potential call to `done` after `endAsync`
                originalSetTimeout(function () {
                    me.finalize()
                }, 1)
        },
        
        
        clearTimeouts : function () {
            var originalClearTimeout    = this.originalClearTimeout
            
            Joose.O.each(this.timeoutIds, function (value, id) {
                originalClearTimeout(value)
            })
            
            this.timeoutIds = {}
        },
        
        
        // deprecated
        skipIf : function (condition, why, code, howMany) {
            howMany = howMany || 1
            
            if (condition) {
                
                for (var i = 1; i <= howMany; i++) this.addResult(new Siesta.Result.Assertion({
                    passed      : true,
                    isSkipped   : true,
                    
                    description : 'SKIPPED: ' + why
                }))    
                
            } else
                code()
        },
        
        
        // deprecated
        skip : function (why, code, howMany) {
            this.skipIf(true, why, code, howMany)
        },
        
        
        processSubTestConfig : function (config) {
            return Joose.O.extend({
                trait                   : Siesta.Test.Sub,
                
                parent                  : this,
                
                isTodo                  : this.isTodo,
                transparentEx           : this.transparentEx,
                
                waitForTimeout          : this.waitForTimeout,
                waitForPollInterval     : this.waitForPollInterval,
                defaultTimeout          : this.defaultTimeout,
                timeout                 : this.subTestTimeout,
                
                global                  : this.global,
                url                     : this.url,
                scopeProvider           : this.scopeProvider,
                harness                 : this.harness,
                generation              : this.generation,
                
                overrideSetTimeout      : false,
                originalSetTimeout      : this.originalSetTimeout,
                originalClearTimeout    : this.originalClearTimeout,
                
                autoCheckGlobals        : false,
                needToCleanup           : false
            }, config)            
        },
        
        
        /**
         * Returns a new instance of the test class, configured as being a "sub test" of the current test.
         * 
         * The number of nesting levels is not limited - ie sub-tests may have own sub-tests.
         * 
         * Note, that this method does not starts the sub test, but only instatiate it. To start the sub test, use {@link #launchSubTest} method. 
         * 
         * @param {String} name The name of the test. Will be used in the UI, as the parent node name in the assertions tree
         * @param {Function} code A function with test code. Will receive a test instance as the 1st argument. 
         * @param {Number} [timeout] A maximum duration (in ms) for this sub test. If test will not complete within this time, 
         * it will be considered failed. If not provided, the {@link Siesta.Harness#subTestTimeout} value is used. 
         * 
         * @return {Siesta.Test} A sub test instance
         */
        getSubTest : function (arg1, arg2, arg3) {
            var config
            var R = Siesta.Resource('Siesta.Test');

            if (arguments.length == 2 || arguments.length == 3) 
                config = {
                    name        : arg1,
                    run         : arg2,
                    timeout     : arg3
                } 
            else if (arguments.length == 1 && this.typeOf(arg1) == 'Function') 
                config  = {
                    name        : 'Sub test',
                    run         : arg1
                }
            
            config              = config || arg1 || {}
            
            // pass-through only valid timeout values
            if (config.timeout == null) delete config.timeout
            
            var name            = config.name
            
            if (!config.run) {
                this.failWithException(R.get('codeBodyMissingForSubTest') + " [" + name + "]")
                throw new Error(R.get('codeBodyMissingForSubTest') + " [" + name + "]")
            }
            if (!config.run.length) {
                this.failWithException(R.get('codeBodyMissingTestArg').replace('{name}', name))
                throw new Error(R.get('codeBodyMissingTestArg').replace('{name}', name))
            }
            
            return new (config.meta || this.constructor)(this.processSubTestConfig(config))
        },
        
        
        /**
         * This method launch the provided sub test instance.
         * 
         * @param {Siesta.Test} subTest A test instance to launch
         * @param {Function} callback A function to call, after the test is completed. This function is called regardless from the test execution result.
         */
        launchSubTest : function (subTest, callback) {
            var me          = this
            var R           = Siesta.Resource('Siesta.Test');

            var async       = this.beginAsync(subTest.timeout || this.subTestTimeout, function () {
                me.fail(R.get('Subtest') + ' ' + (subTest.name ? '[' + subTest.name + ']' : '') + ' ' + R.get('failedToFinishWithin') + ' ' + this.subTestTimeout + ' ' + Siesta.Resource('Siesta.Test.More', 'ms'))
                
                testEndListener.remove()
                
                subTest.finalize(true)
                
                callback && callback(subTest)
                
                return true
            })
            
            var testEndListener = subTest.on('testfinalize', function () {
                me.endAsync(async)
                
                callback && callback(subTest)
            })
            
            this.addResult(subTest.getResults())
            
            subTest.start()
        },
        
        
        /**
         * With this method you can mark a group of assertions as "todo", assuming they most likely will fail,
         * but it's still worth to try to run them.
         * The supplied `code` function will be run, it will receive a new test instance as the 1st argument,
         * which should be used for assertion checks (and not the primary test instance, received from `StartTest`).
         * 
         * Assertions, failed inside of the `code` block will be still treated by harness as "green".
         * Assertions, passed inside of the `code` block will be treated by harness as bonus ones and highlighted.
         *
         * See also {@link Siesta.Test.ExtJS#knownBugIn} method. Note, that this method will start a new {@link #subTest sub test}. 
         *
         * For example:

            t.todo('Scheduled for 4.1.x release', function (todo) {

                var treePanel    = new Ext.tree.Panel()

                todo.is(treePanel.getView().store, treePanel.store, 'NodeStore and TreeStore have been merged and there is only 1 store now');
            })

         * @param {String} why The reason/description for the todo
         * @param {Function} code A function, wrapping the "todo" assertions. This function will receive a special test class instance
         * which should be used for assertion checks
         */
        todo : function (why, code, callback) {
            if (this.typeOf(why) == 'Function') why = [ code, code = why ][ 0 ]
            
            var todo        = this.getSubTest({
                name            : why,
                
                run             : code,
                
                isTodo          : true,
                transparentEx   : false
            })

            this.launchSubTest(todo, callback)
        },
        
        
        /**
         * This method starts a new sub test. Sub tests have separate order of assertions. In the browser UI,
         * sub tests are presented with the "parent" node of the assertions tree. Sub tests are useful if you want to test
         * several asynchronous processes in parallel, and would like to see assertions from every process separated.
         * 
         * Sub tests may have their own sub tests, the number of nesting levels is not limited.
         * 
         * Sub test can contain asynchronous methods as any other tests. Sub tests are considered completed
         * only when all of its asynchronous methods have completed *and* all of its sub-tests are completed too.
         * 
         * For example:
         *

    t.subTest('Load 1st store', function (t) {
        var async   = t.beginAsync()
    
        store1.load({
            callback : function () {
                t.endAsync(async);
                t.isGreater(store1.getCount(), 0, "Store1 has been loaded")
            }
        })
    })
    
    t.subTest('Load 2nd store', function (t) {
        var async   = t.beginAsync()
    
        store2.load({
            callback : function () {
                t.endAsync(async);
                t.isGreater(store2.getCount(), 0, "Store2 has been loaded")
            }
        })
    })

         * Note, that sub test starts right away, w/o waiting for any previous sub tests to complete. If you'd like to run several sub-tests
         * sequentially, use {@link #chain} method in combination with {@link #getSubTest} method. 
         * 
         * @param {String} desc The name of the sub test. Will be shown as the name of the parent node in assertion tree.
         * @param {Function} code The test function to execute. It will receive a test instance as 1st argument. This test instance *must* be
         * used for assertions inside of the test function
         * @param {Function} callback The callback to execute after the sub test completes (either successfully or not)
         * @param {Number} [timeout] A maximum duration (in ms) for this sub test. If test will not complete within this time, 
         * it will be considered failed. If not provided, the {@link Siesta.Harness#subTestTimeout} value is used. 
         */
        subTest : function (desc, code, callback, timeout) {
            var subTest     = this.getSubTest({
                name            : desc || Siesta.Resource('Siesta.Test', 'Subtest'),
                timeout         : timeout,
                run             : code
            })

            this.launchSubTest(subTest, callback)
        },
        
        
        failWithException : function (e) {
            this.failed                 = true
            
            var stackTrace              = this.getStackTrace(e)
            var stringified             = e + ''
            var annotation              = (stackTrace || []).join('\n')
            var R                       = Siesta.Resource('Siesta.Test');

            this.failedException        = stringified
            this.failedExceptionType    = this.typeOf(e)
            
            // prepend the exception message to the stack trace if its not already there
            if (annotation.indexOf(stringified) == -1) annotation = stringified + annotation
            
            this.addResult(new Siesta.Result.Assertion({
                isException     : true,
                exceptionType   : this.failedExceptionType,
                passed          : false,
                description     : (this.parent ? R.get('Subtest') + " `" + this.name + "`" : R.get('Test') + ' ') + ' ' + R.get('threwException'),
                annotation      : annotation
            }))
            
            
            /**
             * This event is fired when an individual test case has thrown an exception.
             * 
             * This event bubbles up to the {@link Siesta.Harness harness}, so you can observe it on the harness as well.
             * 
             * @event testfailedwithexception
             * @member Siesta.Test
             * @param {JooseX.Observable.Event} event The event instance
             * @param {Siesta.Test} test The test instance that just threw an exception
             * @param {Object} exception The exception thrown
             */
            this.fireEvent('testfailedwithexception', this, e, stackTrace);
            
            this.finalize(true)
        },
        
        
        start : function (alreadyFailedWithException) {
            var R = Siesta.Resource('Siesta.Test');

            if (this.startDate) {
                throw R.get('testAlreadyStarted');
            }

            this.startDate  = new Date() - 0
            
            /**
             * This event is fired when an individual test case starts. When *started*, the test may still be waiting for the {@link #isReady} condition
             * to be fullfilled. Once all conditions are fullfilled the test will be *launched*.
             * 
             * This event bubbles up to the {@link Siesta.Harness harness}, you can observe it on harness as well. 
             * 
             * @event teststart
             * @member Siesta.Test
             * @param {JooseX.Observable.Event} event The event instance
             * @param {Siesta.Test} test The test instance that just has started
             */
            this.fireEvent('teststart', this);
            
            if (alreadyFailedWithException) {
                this.failWithException(alreadyFailedWithException) 
                
                return
            }
            
            if (this.parent) {
                this.launch()
                return
            }
            
            var me              = this;
            var errorMessage; 
            var readyRes        = me.isReady();
            
            // Note, that `setTimeout, setInterval` and similar methods here are from the harness context
            
            var cont            = function (isReadyError) {
                var hasTimedOut     = false
                
                var setupTimeout    = setTimeout(function () {
                    hasTimedOut     = true
                    me.launch(R.get('setupTookTooLong'))
                }, me.isReadyTimeout)
                
                me.setup(
                    function () {
                        if (!hasTimedOut) {
                            clearTimeout(setupTimeout)
                            me.launch()
                        }
                    },
                    function (setupError) {
                        if (!hasTimedOut) {
                            clearTimeout(setupTimeout)
                            me.launch(setupError)
                        }
                    }
                );
            }
            
            if (readyRes.ready) {
                // We're ready to go
                cont();
            } else {
                // Need to wait for isReady to give green light
                var timeout         = setTimeout(function () {
                    clearInterval(interval)
                    cont(errorMessage)
                    
                }, me.isReadyTimeout)
                
                var interval = setInterval(function(){ 
                    readyRes = me.isReady();
                
                    if (readyRes.ready) {
                        clearInterval(interval)
                        clearTimeout(timeout)
                        cont();
                    } else {
                        errorMessage = readyRes.reason || errorMessage;
                    }
                }, 100);
            }
        },
        
        
        /**
         * This method can perform any setup code your tests need. It is called before the begining of every test and receives
         * a callback and errback, which should be called once the setup has completed. Typical usage for this method can be for example
         * to log in into the application, before interacting with it:
         * 

    Class('My.Test.Class', {
        
        isa         : Siesta.Test.Browser,
            
        override : {
            
            setup : function (callback, errback) {
                Ext.Ajax.request({
                    url     : 'do_login.php',
                    
                    params  : { ... },
                    
                    success : function () {
                        callback()
                    },
                    failure : function () {
                        errback('Login failed')
                    }
                })
            }
        },
        
        ....
    })

         * 
         * This method will be called *after* the {@link #isReady} method has reported that the test is ready to start.
         * 
         * If the setup has failed for some reason, then an errback should be called and a failing assertion will be added to the test
         * (though the test will be lauched anyway). A text of the failed assertion can be given as the 1st argument for the errback.
         * 
         * Note, that the setup is supposed to be completed within the {@link #isReadyTimeout} timeout, otherwise it will be
         * considered failed and the test will be launched with a failed assertion.
         * 
         * @param {Function} callback A function to call when the setup has completed successfully
         * @param {Function} errback A function to call when the setup has completed with an error
         */
        setup : function (callback, errback) {
            callback.call(this)
        },
            

        launch : function (errorMessage) {
            if (errorMessage) {
                var R = Siesta.Resource('Siesta.Test');

                this.fail(R.get('errorBeforeTestStarted'), {
                    annotation      : errorMessage
                })
            }
            
            var me                      = this
            var global                  = this.global
            
            // trying to focus the window (hopefully fixes the tab key issues)
            global.focus && global.focus()
            
            var scopeProvider           = this.scopeProvider
            
            var originalSetTimeout      = this.originalSetTimeout
            var originalClearTimeout    = this.originalClearTimeout
            
            // this.overrideSetTimeout
            if (this.overrideSetTimeout) {
                // see http://www.adequatelygood.com/2011/4/Replacing-setTimeout-Globally
                scopeProvider.runCode('var setTimeout, clearTimeout;')
                
                global.setTimeout = function (func, delay) {
                    
                    var index = me.timeoutsCount++
                    
                    // in NodeJS `setTimeout` returns an object and not a simple ID, so we try hard to store that object under unique index
                    // also using `setTimeout` from the scope of test - as timeouts in different scopes in browsers are mis-synchronized
                    var timeoutId = originalSetTimeout(function () {
                        originalClearTimeout(timeoutId)
                        delete me.timeoutIds[ index ]
                        
                        // if the test func has been executed, but the test was not finalized yet - then we should try to finalize it
                        if (me.processed && !me.isFinished())
                            // we are doing that after slight delay, potentially allowing to setup some other async frames in the "func" below
                            originalSetTimeout(function () {
                                me.finalize()
                            }, 1)
                        
                        func()
                        
                    }, delay)
    
                    // in NodeJS saves the index of the timeout descriptor to the descriptor
                    if (typeof timeoutId == 'object') 
                        timeoutId.__index = index
                    else
                        // in browser (where `timeoutId` is a number) - to the `idsToIndex` hash
                        me.idsToIndex[ timeoutId ] = index
                        
                    return me.timeoutIds[ index ] = timeoutId
                }
                
                global.clearTimeout = function (id) {
                    if (id == null) return
                    
                    var index
                    
                    // in NodeJS `setTimeout` returns an object and not a simple ID
                    if (typeof id == 'object') {
                        index       = id.__index
                        if (me.timeoutIds[ index ] != id) throw "Incorrect state"
                    } else {
                        index       = me.idsToIndex[ id ]
                        
                        delete me.idsToIndex[ id ]
                    }
                    
                    originalClearTimeout(id)
                    
                    if (index != null) delete me.timeoutIds[ index ]
                    
                    // if the test func has been executed, but the test was not finalized yet - then we should try to finalize it
                    if (me.processed && !me.isFinished())
                        // we are doing that after slight delay, potentially allowing to setup some other async frames after the "clearTimeout" will complete
                        originalSetTimeout(function () {
                            me.finalize()
                        }, 1)
                }
            }
            // eof this.overrideSetTimeout
            
            // we only don't need to cleanup up when doing a self-testing or for sub-tests
            if (this.needToCleanup) {
                scopeProvider.beforeCleanupCallback = function () {
                    // if scope cleanup happens most probably user has restarted the test and is not interested in the results
                    // of previous launch
                    // finalizing the previous test in such case
                    if (!me.isFinished()) me.finalize(true)
                    
                    if (me.overrideSetTimeout) {
                        global.setTimeout       = originalSetTimeout
                        global.clearTimeout     = originalClearTimeout
                    }
                    
                    // cleanup the closures just in case (probably useful for IE)
                    originalSetTimeout          = originalClearTimeout  = null
                    global                      = run                   = null
                    
                    me.eachSubTest(function (subTest) {
                        subTest.cleanup()
                    })
                }
            }
            
            var run     = this.run
            
            if (this.transparentEx)
                run(me)
            else 
                var e = this.getExceptionCatcher()(function(){
                    run(me)
                })
            
            this.afterLaunch(e)
        },
        
        
        cleanup : function () {
            this.originalSetTimeout     = this.originalClearTimeout     = null
            this.global                 = this.run                      = null
            this.exceptionCatcher       = this.testErrorClass           = null
            this.startTestAnchor                                        = null
        },
        
        
        // a method executed after the "run" function has been ran - used in BDD role for example
        afterLaunch : function (e) {
            if (e)
                this.failWithException(e)
            else
                this.finalize()
        },
        
        
        finalize : function (force) {
            if (this.isFinished()) return
            
            this.processed = true
            
            if (force) {
                this.clearTimeouts()
                
                this.eachChildTest(function (childTest) { childTest.finalize(true) })
            }
            
            if (!Joose.O.isEmpty(this.timeoutIds)) {
                if (
                    !this.__timeoutWarning && this.overrideSetTimeout && this.lastActivityDate &&
                    new Date() - this.lastActivityDate > this.defaultTimeout * 2
                ) {
                    var R = Siesta.Resource('Siesta.Test');

                    this.diag(R.get('testStillRunning'));
                    this.warn(R.get('testNotFinalized').replace('{url}', this.url));
                    this.__timeoutWarning = true;
                }

                return
            }

            if (!this.needDone && !this.isDone) {
                // this is the early "testfinalize" hook, we need "early" and "regular" hooks, since we want the globals check to be the last assertion
                this.fireEvent('beforetestfinalizeearly', this)

                // Firing the `beforetestfinalizeearly` events may trigger additional test actions
                if (!Joose.O.isEmpty(this.timeoutIds)) {
                    if (force)
                        this.clearTimeouts()
                    else
                        return
                }

                /**
                 * This event is fired before each individual test case ends (no any corresponding Harness actions will have been run yet).
                 * 
                 * This event bubbles up to the {@link Siesta.Harness harness}, so you can observe it on the harness as well.
                 * 
                 * @event beforetestfinalize
                 * @member Siesta.Test
                 * @param {JooseX.Observable.Event} event The event instance
                 * @param {Siesta.Test} test The test instance that is about to finalize
                 */
                this.fireEvent('beforetestfinalize', this);
            }
            
            this.endDate = new Date() - 0

            if (!this.parent) this.addResult(new Siesta.Result.Summary({
                isFailed            : this.isFailed(),
                description         : this.getSummaryMessage()
            }))
            
            /**
             * This event is fired when an individual test case ends (either because it has completed correctly or thrown an exception).
             *
             * This event bubbles up to the {@link Siesta.Harness harness}, so you can observe it on the harness as well.
             *
             * @event testfinalize
             * @member Siesta.Test
             * @param {JooseX.Observable.Event} event The event instance
             * @param {Siesta.Test} test The test instance that just has completed
             */
            this.fireEvent('testfinalize', this);
            
            // a test end event that bubbles
            this.fireEvent('testendbubbling', this);
            
            this.callback && this.callback()
        },
        
        
        getSummaryMessage : function (lineBreaks) {
            var res             = []
            
            var passCount       = this.getPassCount()
            var failCount       = this.getFailCount()
            var assertPlanned   = this.assertPlanned
            var total           = failCount + passCount
            
            res.push('Passed: ' + passCount)
            res.push('Failed: ' + failCount)
            
            if (!this.failed) {
                // there was a t.plan() call
                if (assertPlanned != null) {
                    if (total < assertPlanned) 
                        res.push('Looks like you planned ' + assertPlanned + ' tests, but ran only ' + total)
                        
                    if (total > assertPlanned) 
                        res.push('Looks like you planned ' + assertPlanned + ' tests, but ran ' +  (total - assertPlanned) + ' extra tests, ' + total + ' total.')
                    
                    if (total == assertPlanned && !failCount) res.push('All tests passed')
                } else {
                    var R = Siesta.Resource('Siesta.Test');

                    if (!this.isDoneCorrectly()) res.push(R.get('missingDoneCall'))
                    
                    if (this.isDoneCorrectly() && !failCount) res.push(R.get('allTestsPassed'))
                }
            }
            
            return lineBreaks ? res.join(lineBreaks) : res
        },
        
        
        /**
         * This method indicates that the test has completed at the expected point and no more assertions are planned. Adding assertions after the call to `done`
         * will add a failing assertion "Adding assertion after test completion".
         * 
         * @param {Number} delay Optional. When provided, the test will not complete right away, but will wait for `delay` milliseconds for additional assertions. 
         */
        done : function (delay) {
            var me      = this
            
            if (delay) {
                var async = this.beginAsync()
                
                var originalSetTimeout = this.originalSetTimeout
                
                originalSetTimeout(function () {
                    
                    me.endAsync(async)
                    me.done() 
                
                }, delay)
                
            } else {
                this.fireEvent('beforetestfinalizeearly')
                this.fireEvent('beforetestfinalize');
                
                this.isDone = true
                
                if (this.processed) this.finalize()
            }
        },
        
        // `isDoneCorrectly` means that either test does not need the call to `done`
        // or the call to `done` has been already made
        isDoneCorrectly : function () {
            return !this.needDone || this.isDone
        },
        
        
        getAssertionCount : function (excludeTodo) {
            var count   = 0
            
            this.eachAssertion(function (assertion) {
                if (!excludeTodo || !assertion.isTodo) count++
            })
            
            return count
        },
        
        
        // cached method except the "includeTodo" case
        getPassCount : function (includeTodo) {
            if (this.$passCount != null && !includeTodo) return this.$passCount
            
            var passCount = 0
            
            this.eachAssertion(function (assertion) {
                if (assertion.passed && (includeTodo || !assertion.isTodo)) passCount++
            })
            
            return includeTodo ? passCount : this.$passCount = passCount
        },

        getTodoPassCount : function () {
            var todoCount = 0;
            
            this.eachAssertion(function (assertion) {
                if (assertion.isTodo && assertion.passed) todoCount++;
            });
            
            return todoCount;
        },

        getTodoFailCount : function () {
            var todoCount = 0;
            
            this.eachAssertion(function (assertion) {
                if (assertion.isTodo && !assertion.passed) todoCount++;
            });
            
            return todoCount;
        },
        
        
        // cached method except the "includeTodo" case
        getFailCount : function (includeTodo) {
            if (this.$failCount != null && !includeTodo) return this.$failCount
            
            var failCount = 0
            
            this.eachAssertion(function (assertion) {
                if (!assertion.passed && (includeTodo || !assertion.isTodo)) failCount++
            })
            
            return includeTodo ? failCount : this.$failCount = failCount
        },
        
        
        getFailedAssertions : function () {
            var failed      = [];
            
            this.eachAssertion(function (assertion) {
                if (!assertion.isPassed()) failed.push(assertion)
            })
            
            return failed
        },
        
        
        isPassed : function () {
            var passCount       = this.getPassCount()
            var failCount       = this.getFailCount()
            var assertPlanned   = this.assertPlanned
            
            return this.isFinished() && !this.failed && !failCount && (
                assertPlanned != null && passCount == assertPlanned
                    ||
                assertPlanned == null && this.isDoneCorrectly()
            )
        },
        
        
        isFailed : function () {
            var passCount       = this.getPassCount()
            var failCount       = this.getFailCount()
            var assertPlanned   = this.assertPlanned
            
            return this.failed || failCount || (
            
                this.isFinished() && ( 
                    assertPlanned != null && passCount != assertPlanned
                        ||
                    assertPlanned == null && !this.isDoneCorrectly()
                )
            )
        },
        
        
        isFailedWithException : function () {
            return this.failed
        },
        
        
        isStarted : function () {
            return this.startDate != null
        },
        
        
        isFinished : function () {
            return this.endDate != null
        },
        
        
        getDuration : function () {
            return this.endDate - this.startDate
        },
        
        
        getBubbleTarget : function () {
            return this.parent || this.harness;
        },
        
        
        warn : function (message) {
            this.addResult(new Siesta.Result.Diagnostic({
                description : message,
                isWarning   : true
            }))
        },
        
        
        flattenArray : function (array) {
            var me          = this
            var result      = []
            
            Joose.A.each(array, function (el) {
                if (me.typeOf(el) == 'Array') 
                    result.push.apply(result, me.flattenArray(el))
                else
                    result.push(el)
            })
            
            return result
        },
        
        
        buildActionableMethods : function () {
            var methods     = {}
            
            this.meta.getMethods().each(function (method, name) {
                methods[ name.toLowerCase() ] = name
            })
            
            return methods
        }
    }
    // eof methods
        
})
//eof Siesta.Test