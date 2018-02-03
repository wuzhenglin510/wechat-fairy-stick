const WechatFairyStick = require('../index');

describe('#get_access_token', function() {

    before(function () {
        global.tool = new WechatFairyStick.Client.Common('wx46736821b6f9dd2f', 'df86a5bafb65fe98706b8f346416de7f');
    });

    it('should success', async function () {
        let res =  tool.decryptUserInfo('ufGKnOip1IgBNe0OCvHIA8u0USTles09Lf9rQQMnq2I1z2WwTOd0+GYQKTv66wFTPWmiBZo0g6MGD/40Fp0rb1MpyBmdQlJeadUvVKtlEM2uo66dFAH3ewSWQI+uSfUtaZ3qAAbEZxjS5Wjl0F4Wx0HjvW7f90n9QHpGfFJHWJz0y9ebS4XdbJmOdziLCx1WyO0p1rcY8eZZTVeBtu5/9e/8PvY9mSry8hKEhkHz4J62aZNxOhWVyTNNIpzdo0/OYPkk9ze6eNE2g9qDqVQSCYDkBNOmqHokmAemY+WDGEbH9Wf5Q2ZHCIzVu1cnvIQgXMwkTblYq1vP+oRZY/1/+l2bQTMo6fEL29CKjLuPAzhWTIW1cSbAksiommSNPL3M1ma+vFlauXTlo/Ma/7SiqMwDEceN+Te49FcWbgLCzGw11KJwkMLmbM+Iikbq9p6mpYs10C5Bs0W1yjcjeLgQkc28uTM45T0XeRMZ9QklZvE03Vx+LRnK5w+aU0IKycSL',
        '3xc2LEl9qs8FlXPzF3yzmQ==',
        'Fd17MpA3EkOUZYDaZFV8HA==');
        console.log(res)
    })
});