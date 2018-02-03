const crypto = require('crypto');
const convert = require('xml2js').parseString;

module.exports = {
    decrypt: decrypt,
    sha1: sha1,
};

function sha1(params) {
    let material = params.sort().join('');
    let sha1 = crypto.createHash('sha1');
    sha1.update(material);
    return sha1.digest('hex');
}

async function decrypt(xml, signature, appid, aesKey, token, timestamp, nonce) {
    let Encrypt = xml.xml.encrypt[0];
    //检查签名
    let sig = _signature(token, timestamp, nonce, Encrypt);
    if (sig != signature)
        throw new Error(`our signature: ${sig}, their signature: ${signature}`);
    let decryptedMessage = _decrypt(Encrypt, aesKey, appid);
    let result = await new Promise((resolve, reject) => {
        convert(decryptedMessage, (err, result) => {
            resolve(restructure(result));
        });
    });
    return result;
}

function encrypt() {

}

function _signature(token, timestamp, nonce, encrypt) {
    let signature = [token, timestamp, nonce, encrypt].sort().join('');
    let sha1 = crypto.createHash('sha1');
    sha1.update(signature);
    return sha1.digest('hex');
}

function _decrypt(str, aesKey, ourAppId) {
    aesKey = new Buffer(aesKey + '=', 'base64');
    let iv = aesKey.slice(0, 16);
    let aesCipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);
    aesCipher.setAutoPadding(true);
    let decipheredBuff = Buffer.concat([aesCipher.update(str, 'base64'), aesCipher.final()]);
    decipheredBuff = _PKCS7Decoder(decipheredBuff);
    let lenNetOrderCorpid = decipheredBuff.slice(16);
    let msgLen = lenNetOrderCorpid.slice(0, 4).readUInt32BE(0);
    let result = lenNetOrderCorpid.slice(4, msgLen + 4).toString();
    let appId = lenNetOrderCorpid.slice(msgLen + 4).toString();
    if (appId !== ourAppId) {
        throw new Error('appId is invalid');
    }
    return result;
}

function _PKCS7Decoder(buff) {
    let pad = buff[buff.length - 1];
    if (pad < 1 || pad > 32) {
        pad = 0;
    }
    return buff.slice(0, buff.length - pad);
}

function restructure(xml2obj) {
    let obj = {};
    for (let key of Object.keys(xml2obj.xml)) {
        obj[key] = xml2obj.xml[key][0];
    }
    return obj;
}