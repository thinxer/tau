/**
 * For debug view.
 */
(function() {

    // Add debug handler
    R.path('debug', function() {
        U.render('debug').fillTo('#main').done(function() {
            jQuery(function() {
                for (var k in T) {
                    jQuery('<option/>').attr({
                        'value':k
                    }).text(k).appendTo('#action');
                }
            });
            jQuery('#submit').click(function() {
                var action = jQuery('#action option:selected').val();
                var values = eval('({' + jQuery('#values').val() + '})');
                var result = jQuery('#result');
                result.text('Loading...');
                T[action](values).success(function(d) {
                    console.log(d);
                    result.text(JSON.stringify(d, null, '    '));
                }).fail(function(err) {
                    console.log(err);
                    result.text('');
                    if (err.responseText && err.responseText.length > 1024) {
                        var i = jQuery('<iframe/>').appendTo(result);
                        i.css({width:'100%', height: '500px'});
                        i[0].contentDocument.body.innerHTML = err.responseText;
                    } else {
                        result.text(JSON.stringify(err, null, '    '));
                    }
                });
            });
        });
    });
})();

// vim: set et ts=4 sw=4 tw=0 :
