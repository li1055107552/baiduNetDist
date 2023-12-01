# baiduNetDist

百度云盘 上传文件demo


## 步骤

### 1. 完善你的信息

1. 登录[百度网盘开放平台](https://pan.baidu.com/union)
2. 进入[控制台](https://pan.baidu.com/union/console/applist)
3. 创建应用

    根据自己的需求，选择软件/硬件，填写名称，描述

4. 进入到应用里，然后将 `Auth/auth.js` 里的 `conf` 信息完善

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

## 近期更新

2023.12.2 `test.js` 文件更新了用了，修复了一些使用上的bug，`handle.js` 还未同步更新，建议参考 `test.js` 中的 `handle_test()`
