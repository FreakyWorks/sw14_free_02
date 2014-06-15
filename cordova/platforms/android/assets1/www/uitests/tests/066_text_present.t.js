StartTest(function(t) {

    t.it('waitForTextPresent', function(t) {

        t.chain(
            function(next) {
                t.waitForTextPresent('foo', next)

                setTimeout(function(){
                    document.body.innerHTML = 'foo';
                }, 100);
            },

            function(next) {
                t.waitForTextNotPresent('foo', next)

                setTimeout(function(){
                    document.body.innerHTML = 'bar';
                }, 100);
            },

            function(next) {
                t.pass('All seems well')
            }
        )
    })
});
