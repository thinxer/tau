(function() {

var settingsHandler = function(path, oldPath, level) {
    U.PAGE.header.show();

    var basicInfoSubmit = function(e) {
        e.preventDefault();

        var basic_info = jQuery('#settings .basic_info');

        // Clear error indicators.
        basic_info.find('input').removeClass('error');

        // Collect user inputs.
        var d = {};
        basic_info.find('input,textarea').each(function(i, t) {
            d[t.name] = t.value;
        });

        // Check user inputs.
        d['action'] = 'update_profile';
        U.info(_('saving...'), 0);
        T.validate(d).success(function(res) {
            if (res.success) {
                // Correct, submit it.
                T.update_profile(d).success(function() {
                    U.success(_('your profile have been saved'));
                });
            } else {
                // Validation failed. Point to wrong field.
                basic_info.find('[name="' + res.key + '"]').addClass('error').focus();
            }
        });
    };

    // Load user info and render the template.
    T.current_user().success(function(userinfo) {
        U.render('settings', userinfo).fillTo('#main').done(function() {
            // Set up basic info submit button.
            jQuery('#settings .basic_info form').submit(basicInfoSubmit);

            // Set up photo upload form.
            var iframe = jQuery('<iframe name="_photo_upload"/>');
            iframe.css({'display': 'none'})
            var form = jQuery('#settings .photo_upload_form');
            form.after(iframe).attr('target', '_photo_upload');
            iframe.load(function() {
                var json_text = jQuery(iframe[0].contentWindow.document.body).text();
                if (json_text) {
                    var data = eval('(' + json_text + ')');
                    if (data.success) {
                        T.current_user().success(function(d) {
                            jQuery('#settings .photo_box img').attr('src', d.photo);
                        });
                        U.success(_('photo saved'), 3000);
                    } else {
                        U.error(_('photo update failed'));
                    }
                }
            });
            form.find('[type=file]').change(function() {
                form.submit();
                U.info(_('uploading...'));
            });
        });
    });
};

R.path('settings', settingsHandler);

})();
