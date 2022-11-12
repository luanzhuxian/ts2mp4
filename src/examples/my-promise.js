Promise.all = function (iterators) {
    return new Promise((resolve, reject) => {
        if (!iterators || iterators.length === 0) {
            resolve([])
            return
        }
        // 计数器，用于判断所有任务是否执行完成
        let count = 0
        let result = new Array(iterators.length)
        // 注意要用 let，若用 var 则需创造局部作用域
        for (let i = 0; i < iterators.length; i++) {
            // 考虑到 iterators[i] 可能是普通对象，则统一包装为 Promise 对象
            Promise.resolve(iterators[i]).then((data) => {
                // 按顺序保存对应的结果
                result[i] = data
                // 当所有任务都执行完成后，再统一返回结果
                if (++count === iterators.length) {
                    resolve(result)
                }
            }).catch((err) => {
                // 任何一个 Promise 对象执行失败，则调用 reject 方法
                return reject(err)
            })
        }
    })
}

Promise.race = function (iterators) {
    return new Promise((resolve, reject) => {
        for (const iter of iterators) {
            Promise.resolve(iter).then((res) => {
                resolve(res)
            }).catch((e) => {
                reject(e)
            })
        }
    })
}

class MyPromise {
    constructor (fn) {
        this.state = 'Pending'
        this.resolveCbs = []
        this.rejectCbs = []
        fn.call(this, this.resolve, this.reject)
    }
    
    resolve (response) {
        if (this.state !== 'Pending') {
            return
        }
        this.state = 'Fullfill'
        
        for (let cb of this.resolveCbs) {
            response = cb(response)
        }
    }
    
    reject (error) {
        if (this.state !== 'Pending') {
            return
        }
        this.state = ''
        let response
        const cb = this.rejectCbs.shift()
        response = cb(error)  
    }
    
    then (resolveCb, rejectCb) {
        this.resolveCbs.push(resolveCb)
        this.rejectCbs.push(rejectCb)
    }
    
    catch (rejectCb) {
        this.rejectCbs.push(rejectCb)
    }
    
}
