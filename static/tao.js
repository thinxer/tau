(function(name) {
  var tao = window[name] = {};
  tao.tmpl = {
    load: function(tmpls) {
    },
  }

  tao.getCurrentUser = function(fn) {
    $.getJSON('/api/userinfo', function(d) {
      if (d.error) {
        fn(null);
      } else {
        fn(d);
      }
    });
  };

})('tao');

/* vim: set ts=2 sw=2 nocin si: */
