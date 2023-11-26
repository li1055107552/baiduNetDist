const axios = require('axios')

module.exports = {
    // 获取用户信息
    getUserInfo: async function(access_token){
        return new Promise((resolve, reject) => {
            axios.get(`https://pan.baidu.com/rest/2.0/xpan/nas?method=uinfo&access_token=${access_token}`).then(res => {
                resolve(res.data)
            }).catch(err => {
                reject(err)
            })
        })
    },

    // 获取网盘容量信息
    getQuota: async function(access_token) {
        return new Promise((resolve, reject) => {
            axios.get(`https://pan.baidu.com/api/quota?access_token=${access_token}`, {
                headers:{
                    "User-Agent": "pan.baidu.com"
                }
            }).then(res => {
                resolve(res.data)
            }).catch(err => {
                reject(err)
            })
        })
    }
}