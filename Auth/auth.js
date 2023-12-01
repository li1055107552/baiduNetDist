const path = require('path')
const fs = require('fs')
const axios = require('axios')
const formatParme = require('../utils/formatParme')

const conf = require('../_data/conf')

module.exports = that = {
    // 接收Code
    AuthCode: async function(ctx){
        
        let code = ctx.request.query.code
        // 读取数据
        let authinfos = JSON.parse(fs.readFileSync(path.join(path.resolve(__dirname), "../_data", "authInfos.json")))

        // 获取AccessToken
        let {access_token, refresh_token} = res = await this.getAccessToken(code)

        // 请求用户信息，完善授权用户信息
        const user = require('../User/user')
        let userinfo = await user.getUserInfo(access_token)
        let data = Object.assign(res, userinfo)
        data.ctime = Date.now()

        // 保存access_token, refresh_token, 用户信息
        authinfos[userinfo.uk] = data
        fs.writeFileSync(path.join(path.resolve(__dirname), "../_data", "authInfos.json"), JSON.stringify(authinfos, null, 2), 'utf-8')


        // 授权成功
        return Promise.resolve(true)
    },

    // 发起授权码Code请求
    getCodeUrl: function (){
        let baseURL = `http://openapi.baidu.com/oauth/2.0/authorize?response_type=code`
        const parme = {
            client_id: conf.client_id,
            redirect_uri: conf.redirect_uri,        // "oob",
            scope: conf.scope,
            device_id: conf.device_id,
            qrcode: "1"                 // 让用户通过扫二维码的方式登录百度账号时
            // display: "popup",        // [page, popup, dialog, mobile, tv, pad]
            // force_login: 1           // 强制用户用户输入用户名和密码
        }
        let url = baseURL + "&" + formatParme(parme)
        return url
    },
    
    // 获取AccessToken
    getAccessToken: async function(code){
        let baseURL = `https://openapi.baidu.com/oauth/2.0/token?grant_type=authorization_code`
        const parme = {
            code: code,
            client_id: conf.client_id,
            client_secret: conf.client_secret,
            redirect_uri: conf.redirect_uri
        }
        let url = baseURL + "&" + formatParme(parme)
        
        return new Promise((resolve, reject) => {
            axios.get(url).then(res => {
                console.log(res.data);
                resolve(res.data)
            }).catch(err => {
                reject(err)
            })
        })
        
    },

    // 刷新AccessToken
    refresh_AccessToken: async function(refresh_token){
        return new Promise((resolve, reject) => {
            let baseURL = `https://openapi.baidu.com/oauth/2.0/token?grant_type=refresh_token`
            const parme = {
                refresh_token: refresh_token,
                client_id: conf.client_id,
                client_secret: conf.client_secret
            }
            let url = baseURL + "&" + formatParme(parme)
    
            axios.get(url).then(res => {
                resolve(res.data)
            }).catch(err => {
                reject(err)
            })
        })
    }
} 

async function main(){
    try {
        let {access_token, refresh_token} = await this.getAccessToken("8f84b78e230d744ff141922b0ecf315b")
        console.log(access_token, refresh_token)

        let {new_access_token, new_refresh_token} = await this.refresh_AccessToken(refresh_token)
        console.log(new_access_token, new_refresh_token)

    } catch (error) {
        console.log(error);
        console.log('finish')
    }
    console.log('finish')
}


// let that = require("./auth.js")
main.call(that)