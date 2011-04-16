(function() {

var settingsHandler = function(path, level) {

    var basicInfoSubmit = function() {
        var basic_info = jQuery('#settings .basic_info');

        // Clear error indicators.
        basic_info.find('input').removeClass('error');

        // Collect user inputs.
        var d = {};
        basic_info.find('input').each(function(i, t) {
            d[t.name] = t.value;
        });

        // Check user inputs.
        d['action'] = 'update_profile';
        T.validate(d).success(function(res) {
            if (res.success) {
                // Correct, submit it.
                T.update_profile(d).success(function() {
                    // TODO add friendly indicator.
                    alert('success!');
                });
            } else {
                // Validation failed. Point to wrong field.
                basic_info.find('input[name="' + res.key + '"]').addClass('error').focus();
            }
        });
    };

    // Load user info and render the template.
    T.current_user().success(function(userinfo) {
        U.render('settings', userinfo).fillTo('#main').done(function() {
            // Set up submit button.
            jQuery('#settings .basic_info button.submit').click(basicInfoSubmit);
        });
    });
};

R.path('settings', settingsHandler);

})();
