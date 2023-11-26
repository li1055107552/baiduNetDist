const path = require('path')
const fs = require('fs')

const PROJECT_ROOT_PATH = path.join(path.resolve(__dirname), "..")

module.exports = {
    searchUser(searchKey, searchValue) {
        if (!["access_token", "baidu_name", "netdisk_name", "uk"].includes(searchKey)) return null
        
        let authInfos = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT_PATH, "_data", "authInfos.json")))
        for (const key in authInfos) {
            if (Object.hasOwnProperty.call(authInfos, key)) {
                const info = authInfos[key];
                if (Object.hasOwnProperty.call(info, searchKey) && info[searchKey] == searchValue) {
                    return info
                }
            }
        }
        return null
    }

}