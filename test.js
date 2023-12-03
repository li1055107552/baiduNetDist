const path = require('path');
const conf = require('./_data/conf')
const data = JSON.parse(require('fs').readFileSync('./_data/authInfos.json', "utf-8"))["2701683811"]

function formatParme_test() {
    const formatParme = require('./utils/formatParme')

    console.log(formatParme(["arra", "arrb", "arrc"]), formatParme({
        obja: "a",
        objb: "b",
        objc: ["obja", "objb", "objc"]
    }));
}
// formatParme_test()

// 索引本地以保存的用户信息
function searchUser_test() {
    let searchUser = require('./User/searchUser')
    let res = searchUser.searchUser("baidu_name", "li1055107552")
    console.log(res);
    console.log('finish')
    return res
}
// searchUser_test()

function refresh_token_test() {
    const { writeFileSync } = require('fs')
    const { refresh_AccessToken } = require('./Auth/auth')
    let new_data = JSON.parse(JSON.stringify(data))
    return refresh_AccessToken(data.refresh_token).then(res => {
        console.log(res);
        for (const key in res) {
            if (Object.hasOwnProperty.call(res, key)) {
                const value = res[key];
                new_data[key] = value
            }
        }
        writeFileSync('./_data/authInfos.json', JSON.stringify(new_data, null, 2), "utf-8")
        console.log('finish')
        return res
    })
}
// refresh_token_test()

// 获取用户信息
function getUserInfo_test() {
    const user = require('./User/user')
    return user.getUserInfo(data.access_token).then(res => {
        console.log(res);
        console.log('finish')
        return res
    })
}
// getUserInfo_test()

// 获取网盘容量信息
function getQuota_test() {
    const user = require('./User/user')
    console.log(data.access_token);
    return user.getQuota(data.access_token).then(res => {
        console.log(res);
        console.log('finish')
        return res
    })
}
// getQuota_test()


// 文件预处理
function preUpload_test(result = {}) {
    const upload = require('./UploadFile/upload')
    result.preUpload = upload.preUpload(data.vip_type, filePath = path.resolve("BV1as4y137E5.mp4"))
    // let res = upload.preUpload(data.vip_type, filePath = "BV1as4y137E5.mp4")
    console.log(result.preUpload);
    console.log('finish')
    return Promise.resolve(result)
}
// preUpload_test()

// 文件预上传
function preCreate_test() {
    const upload = require('./UploadFile/upload')

    return preUpload_test().then(result => {
        let block_list = []
        let preUploadData = result.preUpload
        preUploadData.fileTmp.forEach(e => {
            block_list.push(e.blockMD5)
        });

        return upload.preCreate(data.access_token, "/_upload/test_BV1as4y137E5.mp4", preUploadData.fileSize, block_list).then(res => {
            console.log(res);
            if (res.errno !== 0) throw new Error(`preCreate fail: errno: ${res.errno}`)

            console.log('finish')
            result.preCreate = res
            return result
        })

    })



}
// preCreate_test()

// 分片上传
function superfile2() {

    const upload = require('./UploadFile/upload')


    return preCreate_test().then(result => {
        console.log(result);


        result.superfile2 = []
        for (let i = 0; i < result.preCreate.block_list.length; i++) {
            const element = result.preUpload.fileTmp[i];
            result.superfile2.push(
                upload.superfile2(data.access_token, "/_upload/test_BV1as4y137E5.mp4", result.preCreate.uploadid, i, element.blockPath).then(res => {
                    console.log(res);
                    return res
                })
            )
        }
        console.log('finish')
        return Promise.all(result.superfile2).then(() => {
            console.log(result)
            console.log('finish')
            return result
        })
    })

}
// superfile2()


function superfile2_test() {

    const upload = require('./UploadFile/upload')
    let uploadid = 'P1-MTAuMzkuMi4yNDoxNzAxNDU2NzY5Ojg5MjUzMDA3NjY3MTk5NjYxNjg='

    let fileTmp = [{ "blockID": 0, "blockPath": 'E:\\_Project\\百度云盘上下传\\tmp\\0', "blockMD5": 'bd4a9847bd73cddf8cdbe781fe691d20', "blockSize": 33554432 },
    { "blockID": 1, "blockPath": 'E:\\_Project\\百度云盘上下传\\tmp\\1', "blockMD5": '914edfbaebfebb215963778e53fc7148', "blockSize": 33554432 },
    { "blockID": 2, "blockPath": 'E:\\_Project\\百度云盘上下传\\tmp\\2', "blockMD5": 'f45acd09be7f37f564c7bc4311b88147', "blockSize": 33554432 },
    { "blockID": 3, "blockPath": 'E:\\_Project\\百度云盘上下传\\tmp\\3', "blockMD5": 'cc847599dbea561567acafacae0b8b61', "blockSize": 33554432 },
    { "blockID": 4, "blockPath": 'E:\\_Project\\百度云盘上下传\\tmp\\4', "blockMD5": 'a768ded18c44b61fc8b506b5c3cd7c4c', "blockSize": 33554432 },
    { "blockID": 5, "blockPath": 'E:\\_Project\\百度云盘上下传\\tmp\\5', "blockMD5": '8de62cb9616994138dbeb5a51a7f43c4', "blockSize": 14466072 }]

    function loopback(index, result = []) {
        if (index == fileTmp.length) return Promise.resolve(result)
        return upload.superfile2(
            data.access_token,
            "/_upload/test_BV1as4y137E5.mp4",
            uploadid,
            index,
            fileTmp[index].blockPath
        ).then(res => {
            result.push(res)
            return loopback(index + 1, result)
        })
    }
    loopback(0, []).then(result => {
        console.log(result);
    })
}
// superfile2_test()

// 创建远端文件
function create_test() {
    const upload = require('./UploadFile/upload')
    let uploadid = 'N1-NDIuMTk0LjEzMS42MzoxNzAxNjIzMzMwOjg5NzAwMTE3NjY4MDU3MzE3NDE='
    let savePath = "/_upload/BV1cx411W7mZ-腾讯竟然在成都办了个漫展.mp4"
    // return preUpload_test().then(result => {

        let block_list = ['764d7e2e5e7a7aed62b1630eb487f5f1']
        // let preUploadData = result.preUpload
        // preUploadData.fileTmp.forEach(e => {
        //     block_list.push(e.blockMD5)
        // });

        upload.create(data.access_token, uploadid, savePath, 23564260, block_list).then(res => {
            console.log(res);
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
            // result.create = res
            console.log('finish')
            return result
        })
    // })
}
// create_test()

function handle_test() {
    const upload = require('./UploadFile/upload')

    let defalutData = {
        // filePath: path.resolve("E://_Project//B站//功能集合//autoDownload//download//BV1cx411W7mZ-腾讯竟然在成都办了个漫展.mp4"),
        filePath: path.resolve("/home/ubuntu/project/Bilibili/autoDownload/download/BV1cx411W7mZ-腾讯竟然在成都办了个漫展.mp4"),
        access_token: data.access_token,
        savePath: "/_upload/BV1cx411W7mZ-腾讯竟然在成都办了个漫展.mp4",
        block_list: []
    }

    Promise.resolve({}).then(result => {
        console.log("开始预处理...");
        // 预处理
        result.preUpload = upload.preUpload(data.vip_type, defalutData.filePath)
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
                console.log(err);
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

    console.log('finish')
}
handle_test()
