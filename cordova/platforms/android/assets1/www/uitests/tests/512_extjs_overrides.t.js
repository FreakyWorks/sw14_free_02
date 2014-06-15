StartTest(function(t) {

    t.expectGlobals("0", "1");

    t.it('override detection', function(t) {

        t.assertNoGlobalExtOverrides('assertNoGlobalExtOverrides', function() {

            Ext.menu.ColorPicker.override({
                hidePickerOnSelect  : function() {},
                initComponent       : function() {}
            })

            t.globalExtOverrides = null;

            t.getNumberOfGlobalExtOverrides(function(length) {
                t.is(length, 2, 'getNumberOfGlobalExtOverrides');

                t.assertMaxNumberOfGlobalExtOverrides(2, 'foo')
            })

        })

    });
});