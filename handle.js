const data = {
    "expires_in": 2592000,
    "refresh_token": "",
    "access_token": "",
    "session_secret": "",
    "session_key": "",
    "scope": "basic netdisk",
    "avatar_url": "",
    "baidu_name": "",
    "errmsg": "succ",
    "errno": 0,
    "netdisk_name": "",
    "request_id": "",
    "uk": "",
    "vip_type": "",
    "ctime": ""
}

const path = require('path')
const upload = require('./UploadFile/upload')
const user = require('./User/searchUser')
const auth = require('./Auth/auth')

class UploadTask {
    constructor(baidu_name = "") {
        this._baidu_name = baidu_name
        this._isAuth = false

        this.auth(baidu_name)
    }

    auth(baidu_name = "") {
        let userInfo = user.searchUser("baidu_name", baidu_name == "" ? this._baidu_name : baidu_name)
        if (userInfo == null) {
            this._isAuth = false
            this._authUrl = auth.getCodeUrl()
            return false
        }
        this._isAuth = true
        this._baidu_name = baidu_name
        this._userInfo = userInfo
        return true
    }

    async create(
        filePath = "",       // 需要上传的本地文件的绝对路径
        savePath = ""        // "/_upload/" + path.basename(filePath),
    ) {
        if (!this.auth()) return {
            status: false,
            msg: "is not auth"
        }
        if (filePath == "") return {
            status: false,
            msg: "missing parme 'filePath'"
        }
        filePath = path.resolve(filePath)
        let defaultUploadPath = "/apps/NAS同步/" + path.basename(filePath)  // 默认上传路径
        let uploadPath = savePath == "" ? defaultUploadPath : savePath      // 实际上传路径

        // 文件预处理
        let res = upload.preUpload(this._userInfo.vip_type, filePath)

        let block_list = []
        res.fileTmp.forEach(e => {
            block_list.push(e.blockMD5)
        });

        // 预上传
        let preCreateRes = await upload.preCreate(this._userInfo.access_token, uploadPath, res.fileSize, block_list)
        console.log(preCreateRes)

        // 预上传成功 && 需上传的block数量 == 文件分片数量
        if (preCreateRes.errno == 0 && preCreateRes.block_list.length == res.fileTmp.length) {
            // 获得uploadID
            let uploadid = preCreateRes.uploadid
            let promiseArr = []
            // 开始上传
            for (let i = 0; i < res.fileTmp.length; i++) {
                const block = res.fileTmp[i];
                console.log(`共${res.fileTmp.length}个，正在上传第${i + 1}个`);
                console.log(block);
                // 并发上传，不能用!!!服务器会报500 
                // promiseArr.push(upload.superfile2(this._userInfo.access_token, uploadPath, uploadid, i, block.blockPath))

                // 分片上传
                let uploadres = await upload.superfile2(this._userInfo.access_token, uploadPath, uploadid, i, block.blockPath)
                // 校验云端文件MD5和本地文件的MD5
                if (uploadres.md5 != block.blockMD5) {
                    console.log('文件上传检验失败')
                    return null
                }
            }

            // 并发上传，不能用!!!服务器会报500 
            // let promiseRes = await Promise.all(promiseArr)
            // for (let i = 0; i < promiseRes.length; i++) {
            //     const uploadres = promiseRes[i];
            //     if (uploadres.md5 !== res.fileTmp[i].blockMD5) {
            //         console.log('文件上传检验失败')
            //         return null
            //     }
            // }

            // 创建文件
            let createRes = await upload.create(this._userInfo.access_token, uploadid, uploadPath, res.fileSize, block_list)
            console.log(createRes);
            return {
                status: createRes.errno == 0 ? true : false,
                msg: createRes.errno == 0 ? "success" : createRes
            }
        }

        return {
            status: false,
            msg: preCreateRes
        }


    }

}

module.exports = UploadTask

async function ttt() {
    let uploadTask = new UploadTask("li1055107552123")
    console.log(uploadTask)
    if (uploadTask.auth("li1055107552")) {
        // const filePath = "./yj.jpg"
        const filePath = "./BV1as4y137E5.mp4"
        let res = await uploadTask.create(filePath, `/_upload/${path.basename(filePath)}`)
        console.log(res);
        console.log('finish')
    }
}
// ttt()

async function test() {
    const filePath = "./yj.jpg"     // "./BV1as4y137E5.mp4"
    const savePath = "/apps/NAS同步/" + path.basename(filePath)


    let res = await upload.upload(data.access_token, filePath, savePath)
    console.log(res);
    console.log('finish')
}
// test()

console.log('finish')