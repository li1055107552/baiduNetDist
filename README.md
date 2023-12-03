# baiduNetDist

百度云盘 上传文件demo


## 步骤

### 1. 完善你的信息

1. 登录[百度网盘开放平台](https://pan.baidu.com/union)
2. 进入[控制台](https://pan.baidu.com/union/console/applist)
3. 创建应用

    根据自己的需求，选择软件/硬件，填写名称，描述

4. 进入到应用里，然后将 `Auth/auth.js` 里的 `conf` 信息完善

```js
// _data/conf.js
module.exports = {
    "client_id": "",            // 您应用的AppKey
    "client_secret": "",        // 您应用的SecretKey
    "redirect_uri": "",         // 您应用的授权回调地址
    "device_id": "",            // 您应用的AppID
    "scope": "basic,netdisk"    // 权限
}
```

---

### 2. 扫码授权

启动 `main.js`，然后打开浏览器访问 http://localhost:12000/Auth 登录并授权即可

    授权成功之后，会将授权码Code返回到 `conf.redirect_uri`，收到这个请求之后，你可以获取到Code并进行后续的操作

---

### 3. 准备上传

1. 准备好需要上传的文件
2. 完善 `handle.js` 这个文件 中的 `async function ttt()` 
3. 启动 `handle.js`

## 文件解释

---

## 一些坑

1. 看清请求参数，get请求中的parma，有些是需要自己拼接成完整字符串再进行请求的，有些则直接以参数Object传过去即可

2. 分片的大小

3. 不需要分片的时候，仍建议采用分片的上传模式上传，因为采用单文件模式直接上传，用户可以选择的目录只有 `apps/你的应用名称/` 这个目录下，而采用分片上传最终创建文件的模式 文件夹的路径不受限。

4. 分片上传的速度问题，若上行带宽不足，应当减小分片文件的大小（4Mb），不然单个分片文件上传过久，服务器会报500错误 并中断连接。

    - 可以将 `_data/authInfos.json` 中的 `vip_type`字段改为0，即普通用户（推荐）

    - 可以在调用 `upload.preUpload()` 的地方，第一个参数置为空 `''` 或 `0`

    - 进入到 `upload.preUpload()` 将 `block_size` 改为固定值 `4 * 1024 * 1024` 或将 `vip_type` 改为固定值（不推荐）

## 近期更新

- 2023.12.2 `test.js` 文件更新了用了，修复了一些使用上的bug，`handle.js` 还未同步更新，建议参考 `test.js` 中的 `handle_test()`

- 2023.12.4 `handle.js` 已更新。解决上传过慢导致的问题?
