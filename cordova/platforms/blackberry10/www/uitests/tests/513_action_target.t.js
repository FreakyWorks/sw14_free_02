StartTest(function(t) {
    
    t.it('normalizeActionTarget tests', function(t) {

        var txt = new Ext.form.TextField({
            foo      : 'bar',
            renderTo : document.body
        });

        t.is(t.normalizeActionTarget(txt), txt, 'Component');

        t.is(t.normalizeActionTarget('>>[foo=bar]'), txt, 'CQ')

        t.is(t.normalizeActionTarget(txt.el), txt.el, 'Ext el')

        t.is(t.normalizeActionTarget(txt.el.dom), txt.el.dom, 'DOM')

        t.throwsOk(function() {
            t.warn = function() {};

            t.normalizeActionTarget('>>crap', false)
        }, 'No component found')
    });
});