const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')
const stream = require('stream')
const https = require('https')

// Readable – 可读操作
function bufferToReadStream(buffer) {
    const stream = new Readable()
    stream.push(buffer)
    stream.push(null)
    return stream
}

// Duplex – 可读可写操作
function bufferToDuplexStream(buffer) {
    const stream = new Duplex()
    stream.push(buffer)
    stream.push(null)
    return stream
}

function arrayBufferToDuplexStream(arrayBuffer) {
    const bufferStream = new stream.Duplex()
    bufferStream.push(new Uint8Array(arrayBuffer))
    bufferStream.push(null)
    return bufferStream
}

function arrayBufferToPassThroughStream(arrayBuffer) {
    const bufferStream = new stream.PassThrough()
    bufferStream.end(new Uint8Array(arrayBuffer))
    return bufferStream
}

function readStreamPromise(readStream) {
    const chunks = []
    let chunkLength = 0

    return new Promise((resolve, reject) => {
        readStream.on('data', (chunk) => {
            chunks.push(chunk)
            chunkLength += chunk.length
        })
        readStream.on('end', () => {
            resolve(Buffer.concat(chunks, chunkLength))
        })
        readStream.on('error', e => {
            reject(e)
        })
    })
}

function pipe(rs, ws) {
    return new Promise((resolve, reject) => {
        rs.on('data', (chunk) => {
            ws.write(chunk)
        })
        rs.on('end', () => {
            ws.end()
            resolve()
        })
        rs.on('error', (e) => {
            reject(e)
        })
    })
}

function toBuffer(ab) {
    const buf = new Buffer(ab.byteLength)
    const view = new Uint8Array(ab)
    for (let i = 0; i < buf.length; i++) {
        buf[i] = view[i]
    }
    return buf
}


const url = 'https://embedwistia-a.akamaihd.net/deliveries/97e2ca6d86bcb8750de64ca952d0cd2f6433e60b.m3u8/v2/seg-1-v1-a1.ts'


// fetch(url).then(response => {
//     console.log('ok', response.body.pipe)
//     const writable = fs.createWriteStream(path.resolve(__dirname, 'seg-1-v1-a1.ts'))
//     response.body.pipe(writable)
// })

// fetch(url).then(response => {    
//     response.blob().then(async blob => {
//         const blob1 = blob.slice()
//         const blob2 = blob.slice()

//         // const ab = await blob1.arrayBuffer()
//         // console.log('arrayBuffer', ab)

//         // blob 转 stream
//         const rs = blob2.stream()
//         const ws = fs.createWriteStream(path.resolve(__dirname, 'seg-1-v1-a1.ts'))

//         rs.pipe(ws)
//         rs.on('end', () => console.log('完成'))
//         // await pipe(rs, ws)
//     })
// })

// fetch(url).then(response => {
//     response.arrayBuffer().then(async ab => {
//         console.log('ab', ab)

//         // buffer 转 stream
//         const bufferStream = arrayBufferToDuplexStream(ab)
//         // const bufferStream = arrayBufferToPassThroughStream(ab)
//         console.log('stream', bufferStream)

//         const ws = fs.createWriteStream(path.resolve(__dirname, 'seg-1-v1-a1.ts'))
//         bufferStream.pipe(ws)
//     })
// })


https.get(url, async (res) => {
    console.log(res.statusCode)
    // res.setEncoding('binary')

    // const buffer = await readStreamPromise(res)

    const ws = fs.createWriteStream(path.resolve(__dirname, 'seg-1-v1-a1.ts'))
    res.pipe(ws)
})

