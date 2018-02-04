const rp = require('request-promise');
const request = require('request');
const stream = require('stream');

module.exports = {
    postJson: postJson,
    get: get,
    postJsonGetBuffer: postJsonGetBuffer
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

async function postJsonGetBuffer(uri, jsonData) {
    return new Promise((resolve, reject) => {
        let data = Buffer.alloc(0);
        let jpegStream = new stream.Stream();
        jpegStream.writable = true;
        jpegStream.write = (chunk) => {
            data = Buffer.concat([data, chunk], data.length+chunk.length);
        };
        jpegStream.end = () => {
            jpegStream.writable = false;
            jpegStream.readable = true;
            resolve(data)
        };
        request.post(uri, {
            body: jsonData,
            json: true
        }).pipe(jpegStream);
    });
}