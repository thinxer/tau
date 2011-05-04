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

/**
 * Get human friendly datetime.
 *
 * The following comment lines are used by gettext to extract translations.
 * _('Jan'), _('Feb'), _('Mar'), _('Apr'),
 * _('May'), _('Jun'), _('Jul'), _('Aug'),
 * _('Sep'), _('Oct'), _('Nov'), _('Dec')
 *
 */
(function(_) {
    var month_names = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
    var minute = 60,
        hour = 3600,
        day = 86400;

    _.getReadableDate = function(date){
        var d = new Date(date),
            now = T.getServerTime(jQuery.now()),
            delta = (now - d) / 1000;

        if (delta < minute) {
            return _('just now');
        } else if (delta < hour) {
            return _('%d minutes ago', Math.round(delta/minute));
        } else if (delta < day) {
            return _('%d hours ago', Math.round(delta/hour));
        } else if (delta < 3 * day) {
            return _('%d days ago', Math.round(delta/86400));
        }

        return _(month_names[d.getMonth()]) + _('%d day of month', d.getDate());
    };


})(_);
