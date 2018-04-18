const crypto = require('crypto');
const convert = require('xml2js').parseString;

module.exports = {
    decryptXMLCustomMsgPush: decryptXMLCustomMsgPush,
    decryptUserInfo: decryptUserInfo,
    sha1: sha1,
    encrypt: encrypt,
    signature: signatureFunc
};

function encrypt(text, appId, aesKey) {
    let randomString = crypto.pseudoRandomBytes(16);
    aesKey = new Buffer(aesKey + '=', 'base64');
    let iv = aesKey.slice(0, 16);
    let msg = new Buffer(text);
    let msgLength = new Buffer(4);
    msgLength.writeUInt32BE(msg.length, 0);
    let id = new Buffer(appId);
    let bufMsg = Buffer.concat([randomString, msgLength, msg, id]);
    let encoded = _PKCS7Encoder(bufMsg);
    let cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
    cipher.setAutoPadding(false);
    var cipheredMsg = Buffer.concat([cipher.update(encoded), cipher.final()]);
    return cipheredMsg.toString('base64');
}

function sha1(params) {
    let material = params.sort().join('');
    let sha1 = crypto.createHash('sha1');
    sha1.update(material);
    return sha1.digest('hex');
}

function decryptUserInfo(encryptedData, iv, sessionKey, appid) {
    sessionKey = new Buffer(sessionKey, 'base64');
    encryptedData = new Buffer(encryptedData, 'base64');
    iv = new Buffer(iv, 'base64');
    try {
        let decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv);
        decipher.setAutoPadding(true);
        let decoded = decipher.update(encryptedData, 'binary', 'utf8');
        decoded += decipher.final('utf8');
        decoded = JSON.parse(decoded)
        if (decoded && decoded.watermark.appid !== appid) {
            throw new Error('bad man data')
        }
        return decoded;
    } catch (err) {
        throw new Error('Illegal Buffer');
    }
}

async function decryptXMLCustomMsgPush(xml, signature, appid, aesKey, token, timestamp, nonce) {
    let Encrypt = xml.xml.encrypt[0];
    //检查签名
    let sig = signatureFunc(token, timestamp, nonce, Encrypt);
    if (sig != signature)
        throw new Error(`our signature: ${sig}, their signature: ${signature}`);
    let decryptedMessage = _decryptXMLCustomMsgPush(Encrypt, aesKey, appid);
    let result = await new Promise((resolve, reject) => {
        convert(decryptedMessage, (err, result) => {
            resolve(restructure(result));
        });
    });
    return result;
}



function signatureFunc(token, timestamp, nonce, encrypt) {
    let signature = [token, timestamp, nonce, encrypt].sort().join('');
    let sha1 = crypto.createHash('sha1');
    sha1.update(signature);
    return sha1.digest('hex');
}

function _decryptXMLCustomMsgPush(str, aesKey, ourAppId) {
    aesKey = new Buffer(aesKey + '=', 'base64');
    let iv = aesKey.slice(0, 16);
    let aesCipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);
    aesCipher.setAutoPadding(false);
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

function _PKCS7Encoder(text) {
    let blockSize = 32;
    let textLength = text.length;
    let amountToPad = blockSize - (textLength % blockSize);
    let result = new Buffer(amountToPad);
    result.fill(amountToPad);
    return Buffer.concat([text, result]);
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