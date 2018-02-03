const rp = require('request-promise');

module.exports = {
    postJson: postJson,
    get: get
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

async function get(uri) {
    let options = {
        method: 'GET',
        uri: uri
    };
    return await rp(options);
}