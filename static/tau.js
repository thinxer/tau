/*
 * The tau api module.
 */
(function(name) {
  var tau = window[name] = {};

  tau.getCurrentUser = function(fn) {
    return jQuery.getJSON('/api/userinfo');
  };

})('T');

/* vim: set ts=2 sw=2 nocin si: */
