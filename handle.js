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
        // console.log(userInfo);
        // debugger
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

        let defaultUploadPath = "/apps/NAS同步/" + path.basename(filePath)  // 默认上传路径
        let uploadPath = savePath == "" ? defaultUploadPath : savePath      // 实际上传路径

        let defalutData = {
            filePath: path.resolve(filePath),
            access_token: this._userInfo.access_token,
            savePath: uploadPath,
            block_list: []
        }

        return Promise.resolve({}).then(result => {
            console.log("开始预处理...");
            // 预处理
            result.preUpload = upload.preUpload(this._userInfo.vip_type, defalutData.filePath)
            // console.log(result.preUpload);
            console.log("预处理完成.");
            return result

        }).then(result => {
            console.log("开始文件预上传...")
            // 文件预上传
            let block_list = []
            let preUploadData = result.preUpload
            preUploadData.fileTmp.forEach(e => {
                block_list.push(e.blockMD5)
            });
            defalutData.block_list = block_list

            return upload.preCreate(
                defalutData.access_token,
                defalutData.savePath,
                preUploadData.fileSize,
                block_list
            ).then(res => {
                // console.log(res);
                if (res.errno !== 0) throw new Error(`preCreate fail: errno: ${res.errno}`)
                result.preCreate = res
                console.log("预上传完成.");
                return result
            })

        }).then(result => {
            console.log("开始分片上传...");
            // 分片上传
            let fileTmp = result.preUpload.fileTmp
            function loopback(index, res = []) {
                if (index == fileTmp.length) return Promise.resolve(res)
                console.log(`正在上传第 ${index + 1}/${fileTmp.length} 个分片...`);
                return upload.superfile2(
                    defalutData.access_token,
                    defalutData.savePath,
                    result.preCreate.uploadid,
                    index,
                    fileTmp[index].blockPath
                ).then(response => {
                    if (response.md5 === fileTmp[index].blockMD5) {
                        console.log(`第 ${index + 1}/${fileTmp.length} 个分片上传成功.`);
                    } else {
                        console.error(`第 ${index + 1}/${fileTmp.length} 个分片上传失败, MD5 不匹配`);
                    }
                    res.push(response)
                    return loopback(index + 1, res)
                }).catch(err => {
                    console.log(err.data);
                    return err.data
                })
            }

            return loopback(0, []).then(res => {
                // console.log(res);
                result.superfile2 = res
                console.log("分片上传完成.");
                return result
            })

        }).then(result => {
            console.log("开始创建远端文件...");
            // 创建远端文件
            return upload.create(
                defalutData.access_token,
                result.preCreate.uploadid,
                defalutData.savePath,
                result.preUpload.fileSize,
                defalutData.block_list
            ).then(res => {
                // console.log(res);
                // res = {
                //     "category": 1,
                //     "ctime": 1701458917,
                //     "errno": 0,
                //     "from_type": 1,
                //     "fs_id": 924098806551747,
                //     "isdir": 0,
                //     "md5": 'e481a130ar4a45650bec95bba9f436ff',
                //     "mtime": 1701458917,
                //     "name": '/_upload/test_BV1as4y137E5.mp4',
                //     "path": '/_upload/test_BV1as4y137E5.mp4',
                //     "size": 182238232
                // }
                if (res.errno === 0) {
                    console.log("创建远端文件完成.");
                } else {
                    console.error("创建远端文件失败.");
                }
                result.create = res
                return result
            })
        }).then(result => {
            console.log("执行结束.");
            console.log(result);
            console.log('finish')
            return result

        })

        return {
            status: false,
            msg: preCreateRes
        }


    }

}

module.exports = UploadTask

async function ttt() {
    let uploadTask = new UploadTask("li1055107552")
    // console.log(uploadTask)
    if (uploadTask.auth("li1055107552")) {
        // const filePath = "./yj.jpg"
        // const filePath = "./BV1as4y137E5.mp4"
        const filePath = "/home/ubuntu/project/Bilibili/autoDownload/download/BV1cx411W7mZ-腾讯竟然在成都办了个漫展.mp4"
        // const filePath = `E://_Project//B站//功能集合//autoDownload//download//BV1cx411W7mZ-腾讯竟然在成都办了个漫展.mp4`
        let res = await uploadTask.create(filePath, `/_upload/${path.basename(filePath)}`)
        console.log(res);
        console.log('finish')
    }
}
// ttt()

async function test() {
    const filePath = "./download/BV1cx411W7mZ-腾讯竟然在成都办了个漫展.mp4"     // "./BV1as4y137E5.mp4"
    const savePath = "/apps/NAS同步/" + path.basename(filePath)


    let res = await upload.upload(data.access_token, filePath, savePath)
    console.log(res);
    console.log('finish')
}
// test()

console.log('finish')