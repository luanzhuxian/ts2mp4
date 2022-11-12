const init = require('./src/init')
const run = require('./src/main')

const { m3u8, fileList, tsDir, mp4Path } = init()

console.log('本次资源临时文件路径：', tsDir)
console.log('最终生成mp4路径：', mp4Path)

// console.log(fileList[0].match(/\/(\w+)\.ts/))
// // 文件名
// console.log(fileList[0].replace(/(.*\/)*([^.]+).*/ig, '$2'))
// // 后缀
// console.log(fileList[0].replace(/(.+\.)|(\?.*)/g, ''))

run(fileList, tsDir, mp4Path)