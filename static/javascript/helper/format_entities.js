(function(name) {
    this[name] = this[name] || {};

    /**
     * Replace '&' '<' '>' with '&amp;' '&lt;' '&gt;'.
     */
    var escapeHTML = function(html) {
        return html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    };

    /**
     * This helper method is used to format the message content based on
     * the entities extracted from it, which are like:
     *   {
     *      span: [1,5],
     *      hash: '#foo#'
     *   }
     * the hash field can be url or mention, too.
     */
    this[name].formatEntities = function(content, entities) {
        // Concatenate lists and sort it desending.
        // Why do it backwards? Because i was stupid enough when writing it.
        // Anyway, bad things didn't happen.
        var list = entities.urls.concat(entities.mentions, entities.tags);
        list.sort(function(left, right) {
            return right.span[1] - left.span[1] ;
        });

        var parts = [];
        var last_index = content.length;
        for (var i=0; i<list.length; i++) {
            var item = list[i];

            // prevent overlap
            if (item.span[1] > last_index) continue;

            // normal text between entities
            parts.unshift(escapeHTML(content.substring(item.span[1], last_index)));

            // extract anchor href and text
            var href = '';
            var text = '';
            if ('url' in item) {
                href = item.url;
                text = item.url;
            } else if ('hash' in item) {
                href = '#tag/' + encodeURI(item.hash.slice(1, item.hash.length-1)).replace('/', '%2f');
                text = item.hash;
            } else if ('mention' in item) {
                href = '#u/' + encodeURI(item.mention.substring(1));
                text = item.mention;
            }

            // original text with an anchor
            parts.unshift(_.sprintf('<a href="%s">%s</a>', href, escapeHTML(text)));

            // update last_index
            last_index = item.span[0];
        }
        // the last part
        parts.unshift(escapeHTML(content.substring(0, last_index)));
        // finally join parts together
        return parts.join('');
    }

})('H');
