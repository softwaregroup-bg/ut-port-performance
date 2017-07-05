module.exports = {
    parseInfluxTags: function parseTags(tags) {
        if (tags) {
            return Object.keys(tags).reduce(function(prev, cur) {
                prev += ',' + cur + '=' + (typeof tags[cur] === 'string' ? tags[cur].replace(/ /g, '\\ ') : tags[cur]);
                return prev;
            }, '');
        }
        return '';
    }
};
