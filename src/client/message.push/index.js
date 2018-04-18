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
            this.getDataWithoutReply = decryptXMLToObjWithoutResponse;
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

    async encrypt(replyMsg) {
        let wrap = {}
        wrap.encrypt = Tool.crypt.encrypt(replyMsg, this.appid, this.encodingAESKey);
        wrap.nonce = parseInt((Math.random() * 100000000000), 10);
        wrap.timestamp = new Date().getTime();
        wrap.signature = Tool.crypt.signature(this.token, wrap.timestamp, wrap.nonce, wrap.encrypt);
        let wrapTpl = '<xml>' +
            '<Encrypt><![CDATA[<%-encrypt%>]]></Encrypt>' +
            '<MsgSignature><![CDATA[<%-signature%>]]></MsgSignature>' +
            '<TimeStamp><%-timestamp%></TimeStamp>' +
            '<Nonce><![CDATA[<%-nonce%>]]></Nonce>' +
            '</xml>';
        let encryptWrap = ejs.compile(wrapTpl);
        return encryptWrap(wrap);
    }


};

function getRandomStr(len) {
    let w = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let str = '';
    while(len--) {
        str += w[Math.floor(Math.random() * w.length)];
    }
    return str;
}

async function decryptXMLToObj(expressRequest, expressResponse) {
    let signature = expressRequest.query.msg_signature;
    let timestamp = expressRequest.query.timestamp;
    let nonce = expressRequest.query.nonce;
    let encryptString = expressRequest.body;
    expressResponse.end('SUCCESS');
    return await Tool.crypt.decryptXMLCustomMsgPush(encryptString, signature, this.appid, this.encodingAESKey, this.token, timestamp, nonce);
}

async function decryptXMLToObjWithoutResponse(expressRequest, expressResponse) {
    let signature = expressRequest.query.msg_signature;
    let timestamp = expressRequest.query.timestamp;
    let nonce = expressRequest.query.nonce;
    let encryptString = expressRequest.body;
    return await Tool.crypt.decryptXMLCustomMsgPush(encryptString, signature, this.appid, this.encodingAESKey, this.token, timestamp, nonce);
}