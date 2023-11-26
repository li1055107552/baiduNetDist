const fs = require('fs')
const path = require('path')
const axios = require('axios')
const FormData = require('form-data')

const getMD5 = require('../utils/getMD5')
const formatParme = require('../utils/formatParme')
const PROJECT_ROOT_PATH = path.join(path.resolve(__dirname), "..")
const TMP_PATH = path.join(PROJECT_ROOT_PATH, "tmp")

function onUploadProgress(progressEvent) {
    const { loaded, total } = progressEvent;
    const progress = Math.round((loaded / total) * 100);
    console.log(`Upload Progress: ${progress}%`);
}

module.exports = {
    // 上传前的文件准备工作
    preUpload: function (vip_type = 0, filepath) {
        fs.existsSync(TMP_PATH) ?
            fs.readdirSync(TMP_PATH) ?
                (fs.rmSync(TMP_PATH, { recursive: true, force: true }) & fs.mkdirSync(TMP_PATH)) :
                null :
            fs.mkdirSync(TMP_PATH)

        // 根据AccessToken，找出该用户的类型

        // 判断是 普通用户=4M | 普通会员=16M | 超级会员=32M 来决定上传的块的上限
        let block_size = (vip_type == 2 ? 32 : vip_type == 1 ? 16 : 4) * 1024 * 1024
        let fileStat = fs.statSync(filepath)

        let res = {
            filepath: filepath,
            fileSize: fileStat.size,
            fileMD5: "",
            fileTmp: []
        }

        // 读取文件
        let file = fs.readFileSync(filepath)
        res.fileMD5 = getMD5(file)

        // 判断是否需要分片，若 文件大小 > 块的大小，则需要分片上传
        if (fileStat.size > block_size) {
            // 计算分片的数量
            const count = Math.ceil(fileStat.size / block_size)
            // 进行分片
            for (let i = 0; i < count; i++) {
                const tmpfile = file.subarray(block_size * i, block_size * (i + 1))
                fs.writeFileSync(path.join(TMP_PATH, `${i}`), tmpfile)
                res.fileTmp.push({
                    blockID: i,
                    blockPath: path.join(TMP_PATH, `${i}`),
                    blockMD5: getMD5(tmpfile),
                    blockSize: tmpfile.length
                })
            }
        }
        else {
            res.fileTmp.push({
                blockID: 0,
                blockPath: filepath,
                blockMD5: res.fileMD5,
                blockSize: res.fileSize
            })
        }

        return res
    },

    // 预上传
    preCreate: async function (access_token, savePath, fileSize, block_list) {
        let conf = {
            path: savePath,     // 网盘路径
            size: fileSize,     // 文件大小
            isdir: '0',         // 是否为文件夹 0否 1是
            autoinit: '1',      // 固定值1
            rtype: '1',         // 1:path冲突 重命名 2:path+block_list冲突 重命名  3:覆盖
            block_list: block_list      // 所有分片的MD5
        }
        let parme = formatParme(conf)
        console.log(parme);
        return new Promise((resolve, reject) => {
            axios.post(`http://pan.baidu.com/rest/2.0/xpan/file?method=precreate&access_token=${access_token}`, parme, {
                headers: {
                    "User-Agent": "pan.baidu.com",
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then(res => {
                console.log(res)
                resolve(res.data)
            }).catch(err => {
                console.error(err);
                reject(err)
            })
        })

    },

    // 分片上传
    superfile2: async function (access_token, savePath, uploadid, partseq, blockPath) {
        let data = new FormData();
        data.append('file', fs.createReadStream(blockPath));

        return new Promise((resolve, reject) => {
            axios.post(`https://d.pcs.baidu.com/rest/2.0/pcs/superfile2?access_token=${access_token}&method=upload&type=tmpfile&path=${savePath}&uploadid=${uploadid}&partseq=${partseq}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data;'
                },
                onUploadProgress: onUploadProgress
            }).then(res => {
                console.log(res.data)
                resolve(res.data)
            }).catch(err => {
                console.error(err);
                reject(err)
            })
        })
    },

    // 创建文件
    create: async function (access_token, uploadid, savePath, size, block_list) {
        let conf = {
            path: savePath,
            size: size,
            isdir: 0,
            rtype: 1,
            uploadid: uploadid,
            block_list: block_list
        }
        let parme = formatParme(conf)
        return new Promise((resolve, reject) => {
            axios.post(`https://pan.baidu.com/rest/2.0/xpan/file?method=create&access_token=${access_token}`, parme, {
                headers: {
                    "User-Agent": "pan.baidu.com"
                }
            }).then(res => {
                console.log(res)
                resolve(res.data)
            }).catch(err => {
                console.error(err);
                reject(err)
            })
        })
    },

    // (小文件)单步上传
    upload: async function (access_token, filePath, savePath) {
        return new Promise((resolve, reject) => {

            let data = new FormData();
            data.append('file', fs.createReadStream(filePath));

            let url = `https://d.pcs.baidu.com/rest/2.0/pcs/file?method=upload&access_token=${access_token}&path=${savePath}`
            axios.post(url, data, {
                headers: {
                    "Content-type": "multipart/form-data;",
                    "Host": "d.pcs.baidu.com"
                }
            }).then(res => {
                console.log(res.data)
                resolve(res.data)
            }).catch(err => {
                console.log(err);
                reject(err)
            })
        })
    }
}



// class block {
//     constructor(){
//         this._size = size
//         this._path = path
//         this._md5 = md5
//         this._id = blockID

//     }
// }

// class file {
//     constructor() {
//         this._size = size
//         this._path = path
//         this._savepath = savePath
//         this._md5 = md5
//         this._blockList = []
//     }



//     splitFile(){

//     }

// }

// class uploadTask {
//     constructor(){
//         this._savepath = "/apps/appName/test.txt"
//         this._isdir = 0
//         this._rtype = 1
//         this._uploadid = uploadid

//     }
// }