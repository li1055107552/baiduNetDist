const fs = require('fs')
const axios = require('axios')

const auth = require('./Auth/auth')
const Koa = require("koa")
const app = new Koa()

const PORT = 12000

app.use(async (ctx, next) => {
    let ip = ctx.get("X-Real-IP")
    console.log(ip);
    console.log(ip, ctx.path);
    console.log(ip, ctx.request.query);

    if (ctx.path === '/') {
        ctx.body = "<h3>百度网盘API</h3>"
        console.log(ctx.get("Content-Type"))
    }
    if (ctx.path.toLowerCase() === ('/Auth').toLowerCase()) {
        ctx.response.redirect(auth.getCodeUrl()) 
        ctx.body = ""
    }
    if (ctx.path.toLowerCase() === ('/AuthCode').toLowerCase()) {
        console.log("???");
        await auth.AuthCode(ctx)
        ctx.body = "<h3>授权成功</h3>"
    }

    await next()
})

app.listen(PORT)