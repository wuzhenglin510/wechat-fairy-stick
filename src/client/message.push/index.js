const Constant = require('../../constant');
const Tool = require('../../lib');

module.exports = class {

    constructor(appid, secret, token, messageType, encodingAESKey=undefined) {
        this.appid = appid;
        this.secret = secret;
        this.token = token;
        this.messageType = messageType;
        this.encodingAESKey = encodingAESKey;

        if (messageType == Constant.MessageType.XML && encodingAESKey != undefined) {
            this.getData = decryptXMLToObj;
        } else {
            throw new Error(`unsupported message/safe type(${messageType}/${encodingAESKey ? 'encrypt' : 'raw'}), maybe will support in the future`);
        }
    }


    async confirmConfig(expressRequest, expressResponse) {
        let signature = expressRequest.query.signature;
        let timestamp = expressRequest.query.timestamp;
        let nonce = expressRequest.query.nonce;
        let ourSign = Tool.crypt.sha1([this.token, timestamp, nonce]);
        if( ourSign == signature ){
            expressResponse.end(expressRequest.query.echostr);
        }else{
            expressResponse.end('failure');
        }
    }

};

async function decryptXMLToObj(expressRequest) {
    let signature = expressRequest.query.msg_signature;
    let timestamp = expressRequest.query.timestamp;
    let nonce = expressRequest.query.nonce;
    let encryptString = expressRequest.body;
    return Tool.crypt.decrypt(encryptString, signature, this.appid, this.aesKey, this.token, timestamp, nonce);
}