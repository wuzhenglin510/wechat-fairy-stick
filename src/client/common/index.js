const Constant = require('../../constant');
const Tool = require('../../lib');
const format = require('string-template');

const URL = {
    LOGIN: 'https://api.weixin.qq.com/sns/jscode2session?appid={appid}&secret={secret}&js_code={js_code}&grant_type=authorization_code'
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

};
