const format = require('string-template');
const Tool = require('../../lib');

const URL =  {
    ACCESS_TOKEN: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={appid}&secret={secret}'
};

module.exports = class {

    constructor(appid, secret) {
        this.appid = appid;
        this.secret = secret;
    }

    async getAccessToken() {
        let url = format(URL.ACCESS_TOKEN, {appid: this.appid, secret: this.secret});
        return await Tool.http.postJson(url);
    }
};
