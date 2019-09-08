module.exports = {
    parseTagsInflux: function parseTags(tags) {
        if (tags) {
            return Object.keys(tags).reduce(function(prev, cur) {
                prev += ',' + cur + '=' + (typeof tags[cur] === 'string' ? tags[cur].replace(/ /g, '\\ ') : tags[cur]);
                return prev;
            }, '');
        }
        return '';
    },
    parseTagsPrometheus: function parseTags(tags) {
        // label_value can be any sequence of UTF-8 characters, but the
        // backslash (\, double-quote ("}, and line feed (\n) characters have to be escaped as \\, \", and \n, respectively.
        const escape = s => ('' + s).replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n');
        if (tags) {
            return '{' + Object.keys(tags).reduce(function(prev, cur) {
                if (prev) prev += ',';
                prev += cur + '="' + escape(tags[cur]) + '"';
                return prev;
            }, '') + '}';
        }
        return '';
    }
};
