const fs = require('fs')
const path = require('path')
const m3u8ToMp4 = require('./src/main2')
const converter = new m3u8ToMp4()

// 具体参数可自行修改
downloadMedia({})

function downloadMedia (opt, callback) {
    let url = opt.url || path.resolve(__dirname, './files/index.m3u8')
    let output = opt.output || './output'
    let filename = opt.filename || 'video.mp4'
    let title = opt.title || '测试视频'
    
    if (!fs.existsSync(output)) {
        fs.mkdirSync(output, {
            recursive: true,
        })
    }

    (async function() {
        try {
            console.log('准备下载...')

            await converter
                .setInputFile(url)
                .setOutputFile(path.resolve(output, filename))
                .start()

            console.log('下载完成!')

            if ( typeof callback === 'function' ) callback()
        } catch (error) {
            throw new Error('哎呀，出错啦! 检查一下参数传对了没喔。', error)
        }
    })() 
}

