const fs = require('fs')
const path = require('path')
const { mkdirs, move, getName } = require('./util')
const config = require('../config/index')

let { host, sourceDir, outputDir, m3u8FileName, keyFileName } = config

/**
 * @param  {Function[]} fns 
 * @returns {Function}
 * compose(f1, f2, f3)('omg') // f1(f2(f3('omg')))
 * 返回 (...args) => ([f3(...args)]) => f1(f2(...[f3(...args)])))
 * 相当于 (...args) => f1(f2(f3(...args))))
 */
function compose (...fns) {
    if (fns.length === 0) {
        return arg => arg
    }
    if (fns.length === 1) {
        return fns[0]
    }
    // reduce 每次都返回一个包装函数，即是下一轮的入参 prev，prev 的入参 ...args 为下一个 fn(...args)
    return fns.reduce((prev, fn) => (...args) => prev(fn(...args)))
}

// function compose (...fns) {
//     return fns.reduce((prev, fn) => fn(prev()))
// }

function step1 (m3u8) {
    return m3u8
        // .split(' ')
        .split('\n')
        .map(item => {
            // if (item.match(/\.key/) && item.match(/\Sign/)) {
            //     const iv = item.split('?')[1].split(',')[1]
            //     return item.split('?')[0].replace(config.host, '') + '",' + iv
            // }
            if (item.match(/\.ts/)) {
                return getName(item) + '.ts'
            }
            return item
        })
        .join('\n')
}

// function step2 (m3u8) {
//     return m3u8
//         .split(' ')
//         .map(item => {
//             if (item.match(/\.ts?/)) {
//                 return item.replace(/\/deliveries\//g, '').replace(/\.m3u8\/v2\//g, '-')
//             }
//             return item
//         })
//         .join('\n')
// }

// function step3 (m3u8) {
//     return m3u8.replace(/\/deliveries\//g, 'https://embedwistia-a.akamaihd.net/deliveries/')
// }

function copyM3u8 (m3u8, outputDir) {
    const outputPath = path.resolve(outputDir, 'index.m3u8')
    fs.writeFileSync(
        outputPath, 
        m3u8,
        undefined,
        'utf-8'
    )
}

function copyKey (outputDir) {
    const sourcePath = path.resolve(__dirname, `../files/${keyFileName}`)
    const destPath = path.resolve(outputDir, 'key.key')
    move(sourcePath, destPath)
}

function getM3u8 (path) {
    const m3u8 = fs.readFileSync(path, 'utf-8')
    // console.log(m3u8)
    return m3u8
}

function getFileList (m3u8) {
    const fileList = m3u8.replace(/\s+/g, '\n').split('\n').filter((item) => item.match(/\.ts/))
    // console.log(fileList)
    return fileList
}

function init () {
    sourceDir = path.resolve('./', sourceDir)
    outputDir = path.resolve('./', outputDir)
    
    let m3u8 = getM3u8(path.resolve(sourceDir, m3u8FileName))
    const fileList = getFileList(m3u8)
    const files = fileList.map(getName)
    const tsDir = path.resolve(sourceDir, `${files[0]}`)
    const mp4Path = path.join(outputDir, `${files[0]}.mp4`)
    
    mkdirs(tsDir)
    
    m3u8 = compose(step1)(m3u8)
    // console.log(m3u8)

    copyM3u8(m3u8, tsDir)
    copyKey(tsDir)

    return {
        m3u8,
        fileList,
        tsDir,
        mp4Path
    }
}

module.exports = init