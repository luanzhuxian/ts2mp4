const fs  = require('fs')
const request = require('request')
const https = require('https')

function myRequest(url, path) {
    return new Promise((resolve, reject) => {
        request(
            {
                url,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1 WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            },
            function (error, response, body) {
                // console.log('stream---', error, response)
                if (!error) {
                    resolve()
                } else {
                    console.error('下载发生错误', error)
                    reject(error)
                }
            }
        )
        .pipe(fs.createWriteStream(path))
    })
}

function myHttps(url, path) {
    return new Promise((resolve, reject) => {
        https.get(url, async (res) => {   
            // console.log(res.statusCode)
            const ws = fs.createWriteStream(path)
            // res.pipe(ws)
            // resolve()

            res.on('data', (chunk) => {
                ws.write(chunk)
            }).on('end', () => {
                ws.end()
                resolve()
            }).on('error', (error) => {
                console.error('发生错误', error.message)
                // reject(e)
            })
        }).on('error', (error) => {
            console.error('下载发生错误', error.message)
            reject(error)
        })
    })
}

module.exports = {
    myRequest,
    myHttps
}