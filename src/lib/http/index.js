const rp = require('request-promise');

module.exports = {
    postJson: postJson,

};


async function postJson(uri, jsonData = {}) {
    let options = {
        method: 'POST',
        uri: uri,
        body: jsonData,
        json: true
    };
    return await rp(options);
}