/**
 * A helper method to do simple translations.
 */
(function(global) {
    /**
     * A simple sprintf function.
     * Taken from: http://24ways.org/code/javascript-internationalisation/6.txt
     */
    var sprintf = function(s) {
        var bits = s.split('%');
        var out = bits[0];
        var re = /^([ds])(.*)$/;
        for (var i=1; i<bits.length; i++) {
            p = re.exec(bits[i]);
            if (!p || arguments[i]==null) continue;
            if (p[1] == 'd') {
                out += parseInt(arguments[i], 10);
            } else if (p[1] == 's') {
                out += arguments[i];
            }
            out += p[2];
        }
        return out;
    }

    // A dict containing all translations.
    var _trans = {};

    // The global translate function.
    var _ = global['_'] = function(msg) {
        var text = _trans[msg] || msg;
        var args = [].slice.call(arguments);
        args[0] = text;
        return sprintf.apply(this, args);
    };

    /**
     * load a translation.
     */
    _.load = function(trans) {
        _trans = trans;
    };

})(this);
