const fs  = require('fs')
const path  = require('path')
const child_process = require('child_process')
const fsextra = require('fs-extra')
// const { getName } = require('./util')
const config = require('../config/index')
const asyncPool = require('./async-pool')
const { myRequest, myHttps } = require('./http/http')

let { host } = config

let tsDir
let mp4Path

async function download (url) {
    // url = host + url
    const p = url.split('?')[0]
    const obj = path.parse(p)
    const tsFilePath = path.join(
        tsDir, 
        // url.split('deliveries/')[1].split('.m3u8')[0] + '-' + obj.base
        obj.base
    )

    console.log('url---', url)
    console.log('p---', p)
    console.log('obj---', obj)
    console.log('tsFilePath---', tsFilePath)

    // return myRequest(url, tsFilePath)
    return myHttps(url, tsFilePath)
}

function generateTxt () {
    console.log('开始生成配置')
    const list = fs.readdirSync(tsDir)
        .filter(item => /\.ts/.test(item))
        .map(item => `file '${tsDir}/${item}'`)

    console.log(`一共${list.length}个ts文件`)

    list.unshift('ffconcat version 1.0')

    try {
        fs.writeFileSync(
            path.join(tsDir, './input.txt'), 
            list.join('\n'), 
            undefined,
            'utf-8'
        )
        console.log('生成配置成功')
    } catch (error) {
        console.log('生成配置发生错误', error)
        return
    }
}

function generateMp4 () {
    console.log('开始合成')
    child_process.exec(
        `cd ${tsDir} && ffmpeg -allowed_extensions ALL -protocol_whitelist 'file,http,https,crypto,tcp,tls' -i index.m3u8 -c copy ${mp4Path}`,
        function (error, stdout, stderr) {
            console.log(error, stdout, stderr)
            if (error) {
                console.error('合成失败..', error)
            } else {
                console.log('合成成功~~', stdout)
                // 删除临时文件
                // fsextra.remove(tsDir, err => {
                //     if (err) {
                //         return console.error('删除文件失败', err)
                //     }
                //     console.log('删除文件成功!')
                // })
            }
        }
    )
}

// async function load (fileList) {
//     if (!fileList.length) {
//         console.log('下载完成')
//         return
//     }
//     const url =  fileList.shift()
//     try {
//         await download(url)
//         await load(fileList)
//     } catch (error) {
//         throw error
//     }
// }

async function load (fileList) {
    const poolLimit = 10
    return asyncPool(poolLimit, fileList, download)
}


module.exports = async function (fileList, ts, mp4) {
    tsDir = ts
    mp4Path = mp4
    try {       
        await load(fileList)
        // generateTxt()
        generateMp4()
    } catch (error) {
        console.error(error)
    }
}
