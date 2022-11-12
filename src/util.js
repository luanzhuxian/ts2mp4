const fs  = require('fs')
const path = require('path')

// 深度优先，先父后子，递归创建文件夹
function mkdirs (dirpath) {
    if (fs.existsSync(dirpath)) {
        return
    }
    if (!fs.existsSync(path.dirname(dirpath))) {
        mkdirs(path.dirname(dirpath))
    }
    fs.mkdirSync(dirpath)
    console.log('创建目录：', dirpath)
}

function move (sourcePath, destPath, isCopy = true) {
    const readStream = fs.createReadStream(sourcePath)
    const writeStream = fs.createWriteStream(destPath)
    readStream.pipe(writeStream)
    if (!isCopy) {
        fs.unlinkSync(sourcePath)
    }
}

const getName = (item) => item.replace(/(.*\/)*([^.]+).*/ig, '$2')

module.exports = {
    mkdirs,
    move,
    getName
}