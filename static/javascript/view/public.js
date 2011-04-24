// for page public.html


(function(name){
    var K=window.K=window.K||{};    // constant
    var C=window.C=window.C||{};    // controller

    K.PUBLIC={
        UID_TOO_SHORT:"用户名太短啦，你能长点吗？",
        PASS_TOO_SHORT:"密码太短了，长点OK？",
        NOT_EMAIL:"你输入的邮箱地址是个邮箱？不像吧?",
        SERVER_ERR:"这个，我们服务器的核能电池没电了，等我们充好电再来光临吧～",
        INVALID_UID:"您的用户ID可能已经被使用了，试试换一个其他的吧"
    };

    var checkLogin = function(u, p) {
        if (u.length < 2) {
            showError(K.PUBLIC.UID_TOO_SHORT);
            return false;
        }
        if (p.length < 2) {
            showError(K.PUBLIC.PASS_TOO_SHORT);
            return false;
        }
        return true;
    };

    var checkRegister = function(u, p, m) {
        if (!checkLogin(u, p)) return false;
        if (!/.+@.+\..+/i.test(m)) {
            showError(K.PUBLIC.NOT_EMAIL);
            return false;
        }
        return true;
    };

    var showError = function(s){
        if (U&&U.PAGE.statusDiv) {
            U.PAGE.statusDiv.show(s);
        } else {
            console.log(U);
        }
    };

    var login = function(u, p) {
        T.login({uid: u, password: p}).success(function() {
            R.path('home');
        }).error(function() {
            c.showError(K.PUBLIC.SERVER_ERR);
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
                            c.showError(K.PUBLIC.INVALID_UID);
                        } else {
                            console.log('unknow server error', resp);
                        }
                    }
                }).error(function() {
                    console.log('server too far away to reach, I believe it\'s 500, server internel error');
                    c.showError(K.PUBLIC.SERVER_ERR);
                });
            }
            return false;
        });

        var extra = jQuery('#public .extra');
        extra.find('a.show_register').click(function(e) {
            form.removeClass('login');
            form.addClass('register');
            form.find('button[type=submit]').text('注册');
            e.preventDefault();
        });
        extra.find('a.show_login').click(function(e) {
            form.removeClass('register');
            form.addClass('login');
            form.find('button[type=submit]').text('登陆');
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
