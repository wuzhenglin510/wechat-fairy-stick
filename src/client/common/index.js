const Tool = require('../../lib');
const format = require('string-template');

const URL = {
    ACCESS_TOKEN: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={appid}&secret={secret}',
    LOGIN: 'https://api.weixin.qq.com/sns/jscode2session?appid={appid}&secret={secret}&js_code={js_code}&grant_type=authorization_code',
    QRCODE: {
        UNLIMIT: 'https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token={access_token}'
    },
    TEMPLATE_MESSAGE: 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token={access_token}',
    CUSTOM_MESSAGE: 'https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token={access_token}'
};

module.exports = class {

    constructor(appid, secret) {
        this.appid = appid;
        this.secret = secret;
    }


    async login(code) {
        let url = format(URL.LOGIN, {appid: this.appid, secret: this.secret, js_code: code});
        return await Tool.http.get(url);
    }

    async getAccessToken() {
        let url = format(URL.ACCESS_TOKEN, {appid: this.appid, secret: this.secret});
        return await Tool.http.get(url);
    }

    decryptUserInfo(encryptedData, iv, sessionKey) {
        return Tool.crypt.decryptUserInfo(encryptedData, iv, sessionKey, this.appid);
    }

    async getUnlimitQRCode(accessToken, param) {
        let url = format(URL.QRCODE.UNLIMIT, {access_token: accessToken});
        return await Tool.http.postJsonGetBuffer(url, param)
    }

    async sendTemplateMessage(accessToken, param) {
        let url = format(URL.TEMPLATE_MESSAGE, {access_token: accessToken});
        return await Tool.http.postJson(url, param);
    }

    async sendCustomMessage(accessToken, param) {
        let url = format(URL.CUSTOM_MESSAGE, {access_token: accessToken});
        return await Tool.http.postJson(url, param);
    }
};
