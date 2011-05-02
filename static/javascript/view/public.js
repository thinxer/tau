// for page public.html


(function(name){

    var checkLogin = function(u, p) {
        if (u.length < 2) {
            U.error(_('login name too short'));
            return false;
        }
        if (p.length < 2) {
            U.error(_('password too short'));
            return false;
        }
        return true;
    };

    var checkRegister = function(u, p, m) {
        if (!checkLogin(u, p)) return false;
        if (!/.+@.+\..+/i.test(m)) {
            U.error(_('illegal email address'));
            return false;
        }
        return true;
    };

    var login = function(u, p) {
        T.login({uid: u, password: p}).success(function(d) {
            if (d.error) {
                U.error(_('wrong username or password'));
                jQuery('#password').focus().select();
            } else {
                U.flash();
                R.path('home');
            }
        }).error(function() {
            U.error(_('server error'));
        });
    };

    var setupLoginRegister = function(){
        var form = jQuery('#public form');
        form.submit(function(e) {
            e.preventDefault();
            var u = jQuery('#uid').val(),
                p = jQuery('#password').val(),
                m = jQuery('#email').val();

            if (form.hasClass('login')) {
                // Check and do login.
                if (!checkLogin(u, p)) return;
                login(u, p);

            } else {
                // Check and do register.
                if (!checkRegister(u, p, m)) return;
                T.register({
                    uid: u,
                    email: m,
                    password: p
                }).success(function(resp) {
                    if (resp.success) {
                        login(u, p);
                    } else if (resp.error) {
                        if (resp.error == -4) {
                            U.error(_('invalid login name'));
                        } else {
                        }
                    }
                }).error(function() {
                    U.error(_('server error'));
                });
            }
            return false;
        });

        var extra = jQuery('#public .extra');
        extra.find('a.show_register').click(function(e) {
            form.removeClass('login');
            form.addClass('register');
            form.find('button[type=submit]').text(_('register'));
            form.find('#email').attr('disabled', false);
            e.preventDefault();
        });
        extra.find('a.show_login').click(function(e) {
            form.removeClass('register');
            form.addClass('login');
            form.find('button[type=submit]').text(_('login'));
            form.find('#email').attr('disabled', true);
            e.preventDefault();
        });
    };

    var setupPlaceHolder = function() {
        var input = jQuery('#public input');
        input.focus(function() {
            var label = jQuery(this).siblings();
            label.hide();
        }).blur(function() {
            var label = jQuery(this).siblings();
            if (jQuery(this).val().length == 0) label.show();
        });
    };

    R.path('public', function() {
        U.render('public').fillTo('#main').done(function() {
            U.PAGE.header.hide();
            setupPlaceHolder();
            setupLoginRegister();
        });
    });

})('PUBLIC');

/* vim: set et ts=4 sw=4 tw=0 :*/
