var ui = {
  setupHome: function() {
    $('#wrapper').html('hi');
  }, 
};

$(function() {
    T.getCurrentUser(function(user) {
        // Check whether user has logged in.
        if (user) {
            // Hooray
            // ui.setupHome();
        } else {
            // Display Sign-up Page.
            // ui.setupRegisterPage();
        }
    });
});

/* vim: set ts=2 sw=2 nocin si: */
