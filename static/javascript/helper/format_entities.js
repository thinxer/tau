(function(name) {
    this[name] = this[name] || {};
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
        var sub = function(oldstr, span, newsub) {
            return oldstr.substring(0, span[0]) + newsub + oldstr.substring(span[1]);
        };
        var list = entities.urls.concat(entities.mentions, entities.tags);
        list.sort(function(left, right) {
            return right.span[1] - left.span[1] ;
        });

        var ret = content;
        var last_index = 1e10;
        for (var i=0; i<list.length; i++) {
            var item = list[i];

            // prevent overlap
            if (item.span[1] >= last_index) continue;
            last_index = item.span[0];

            // extract anchor href and text
            var href = '';
            var text = '';
            if ('url' in item) {
                href = item.url;
                text = item.url;
            } else if ('hash' in item) {
                // TODO further investigation on hash is needed.
                href = '#tag/' + escape(item.hash.slice(1, item.hash.length-1)).replace('/', '%2f');
                text = item.hash;
            } else if ('mention' in item) {
                href = '#u/' + escape(item.mention.substring(1));
                text = item.mention;
            }

            // replace original text with an anchor
            var newstr = _.sprintf('<a href="%s">%s</a>', href, text);
            ret = sub(ret, item.span, newstr);
        }
        return ret;
    }
})('H');
