const t = require('./UploadFile/upload')
const fs = require('fs')
const shell = require('shelljs')

let timeout = async (t) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({
                status: true,
                msg: "succ"
            })
        }, t);
    })
}

async function main(){
    let arr = []
    console.time("label")
    for (let i = 0; i < 3; i++) {
        arr.push(Promise.resolve({
            i: i,
            time: timeout(i * 1000)
        }))
        // console.log(res);
    }
    let rrr = await Promise.all(arr)
    
    console.log(rrr);
    console.timeEnd("label")

    console.log('finish')
}
main()
// const formatParme = require('./utils/formatParme')
// let res = formatParme({
//     a: "test_a",
//     b: "test_b",
//     arr: ["aaa", "bbb", "233"]
// })
// console.log(res);

// const splitFile = require('split-file');
// splitFile.splitFileBySize(filepath, 1024 * 1024 * 4) // 4MB
//     .then((chunks) => {
//         chunks.forEach((chunk, idx) => {
//             console.log(`Chunk ${idx + 1}:`);
//             console.log(chunk);
//             //perforn the read operation
//             // fs.unlink(chunk, (err) => {
//             //     if (err) throw err;
//             //     console.log(`Chunk ${idx + 1} deleted`);
//             // });
//         });
//     })


// shell.exec("split -b 4m yj.jpg tmp/")
// shell.exec("md5 yj.jpg")

// console.log('finish')