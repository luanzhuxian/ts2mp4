function log(...msg) {
  console.log(...msg, new Date())
}

// async function asyncPool(poolLimit, array, iteratorFn) {
//   const ret = [] // 存储所有的异步任务
//   const executing = [] // 存储正在执行的异步任务

//   for (const item of array) {
//     const p = Promise.resolve().then(() => iteratorFn(item, array))
//     // 保存新的异步任务
//     ret.push(p)

//     // 当 poolLimit 值小于或等于总任务个数时，进行并发控制
//     if (poolLimit <= array.length) {
//       // 当任务完成后，从正在执行的任务数组中移除已完成的任务
//       const e = p.then(() => executing.splice(executing.indexOf(e), 1))
//       executing.push(e) // 保存正在执行的异步任务
//       if (executing.length >= poolLimit) {
//         await Promise.race(executing) // 等待较快的任务执行完成
//       }
//     }
//   }

//   return Promise.all(ret)
// }

function asyncPool(poolLimit, array, iteratorFn) {
  let i = 0
  const ret = [] // 存储所有的异步任务
  const executing = [] // 存储正在执行的异步任务

  const enqueue = function () {
    // 边界处理
    if (i === array.length) {
      return Promise.resolve()
    }
    // 每调一次 enqueue，初始化一个 promise
    const item = array[i++]
    const p = Promise.resolve().then(() => iteratorFn(item, array))
    ret.push(p)
    // promise 执行完毕，从 executing 数组中删除
    const e = p.then(() => {
      executing.splice(executing.indexOf(e), 1)
      log('splice', ret, executing)
    })
    // 插入 executing 数字，表示正在执行的 promise
    executing.push(e)
    log('push', ret, executing)

    // 使用 Promise.race，每当 executing 数组中 promise 数量低于 poolLimit，就实例化新的 promise 并执行
    let r = Promise.resolve()
    if (executing.length >= poolLimit) {
      r = Promise.race(executing)
    }
    // 递归，直到遍历完 array
    return r.then(() => enqueue())
  }

  // 返回 r = Promise.resolve() 或 r = Promise.race(executing) 直到 边界条件返回 Promise.resolve()
  return enqueue().then(() => Promise.all(ret))
}

// 从 array 第1个元素开始，初始化 promise 对象，同时用一个 executing 数组保存正在执行的 promise
// 不断初始化 promise，直到达到 poolLimt
// 使用 Promise.race，获得 executing 中 promise 的执行情况，当有一个 promise 执行完毕，继续初始化 promise 并放入 executing 中
// 所有 promise 都执行完了，调用 Promise.all 返回

// 使用
const poolLimit = 2
const array = [1000, 5000, 3000, 2000]
// const timeout = (i) =>
//   new Promise((resolve) => setTimeout(() => resolve(i), i))
const timeout = (i) => {
  log('timeout', i)
  return new Promise((resolve) =>
    setTimeout(() => {
      log('setTimeout', i)
      resolve(i)
    }, i)
  )
}

// asyncPool(poolLimit, array, timeout).then((results) => {
//   console.log(results)
// })

/***************** poolLimit = 5时：一共5秒 *****************/
// push
// [ Promise { <pending> } ]
// [ Promise { <pending> } ] 2021-11-07T09:17:34.478Z
// timeout 1000 2021-11-07T09:17:34.486Z
// push
// [ Promise { <pending> }, Promise { <pending> } ]
// [ Promise { <pending> }, Promise { <pending> } ] 2021-11-07T09:17:34.487Z
// timeout 5000 2021-11-07T09:17:34.487Z
// push
// [ Promise { <pending> }, Promise { <pending> }, Promise { <pending> } ]
// [ Promise { <pending> }, Promise { <pending> }, Promise { <pending> } ] 2021-11-07T09:17:34.487Z
// timeout 3000 2021-11-07T09:17:34.487Z
// push [
//   Promise { <pending> },
//   Promise { <pending> },
//   Promise { <pending> },
//   Promise { <pending> }
// ] [
//   Promise { <pending> },
//   Promise { <pending> },
//   Promise { <pending> },
//   Promise { <pending> }
// ] 2021-11-07T09:17:34.487Z
// timeout 2000 2021-11-07T09:17:34.487Z
// setTimeout 1000 2021-11-07T09:17:35.490Z
// splice [
//   Promise { 1000 },
//   Promise { <pending> },
//   Promise { <pending> },
//   Promise { <pending> }
// ]
// [ Promise { <pending> }, Promise { <pending> }, Promise { <pending> } ] 2021-11-07T09:17:35.491Z
// setTimeout 2000 2021-11-07T09:17:36.494Z
// splice [
//   Promise { 1000 },
//   Promise { <pending> },
//   Promise { <pending> },
//   Promise { 2000 }
// ]
// [ Promise { <pending> }, Promise { <pending> } ] 2021-11-07T09:17:36.494Z
// setTimeout 3000 2021-11-07T09:17:37.489Z
// splice [
//   Promise { 1000 },
//   Promise { <pending> },
//   Promise { 3000 },
//   Promise { 2000 }
// ]
// [ Promise { <pending> } ] 2021-11-07T09:17:37.489Z
// setTimeout 5000 2021-11-07T09:17:39.490Z
// splice [
//   Promise { 1000 },
//   Promise { 5000 },
//   Promise { 3000 },
//   Promise { 2000 }
// ]
// [] 2021-11-07T09:17:39.490Z
// [ 1000, 5000, 3000, 2000 ]


/***************** poolLimit = 2：一共6秒 *****************/
// push
// [ Promise { <pending> } ] [ Promise { <pending> } ] 2021-11-07T09:36:08.242Z
// timeout 1000 2021-11-07T09:36:08.250Z
// push
// [ Promise { <pending> }, Promise { <pending> } ]
// [ Promise { <pending> }, Promise { <pending> } ] 2021-11-07T09:36:08.251Z
// timeout 5000 2021-11-07T09:36:08.251Z
// setTimeout 1000 2021-11-07T09:36:09.253Z
// splice
// [ Promise { 1000 }, Promise { <pending> } ]
// [ Promise { <pending> } ] 2021-11-07T09:36:09.253Z
// push
// [ Promise { 1000 }, Promise { <pending> }, Promise { <pending> } ]
// [ Promise { <pending> }, Promise { <pending> } ] 2021-11-07T09:36:09.253Z
// timeout 3000 2021-11-07T09:36:09.255Z
// setTimeout 3000 2021-11-07T09:36:12.255Z
// splice
// [ Promise { 1000 }, Promise { <pending> }, Promise { 3000 } ]
// [ Promise { <pending> } ] 2021-11-07T09:36:12.256Z
// push
// [
//   Promise { 1000 },
//   Promise { <pending> },
//   Promise { 3000 },
//   Promise { <pending> }
// ]
// [ Promise { <pending> }, Promise { <pending> } ] 2021-11-07T09:36:12.256Z
// timeout 2000 2021-11-07T09:36:12.257Z
// setTimeout 5000 2021-11-07T09:36:13.252Z
// splice
// [
//   Promise { 1000 },
//   Promise { 5000 },
//   Promise { 3000 },
//   Promise { <pending> }
// ]
// [ Promise { <pending> } ] 2021-11-07T09:36:13.252Z
// setTimeout 2000 2021-11-07T09:36:14.263Z
// splice
// [
//   Promise { 1000 },
//   Promise { 5000 },
//   Promise { 3000 },
//   Promise { 2000 }
// ]
// [] 2021-11-07T09:36:14.264Z
// [ 1000, 5000, 3000, 2000 ]



module.exports = asyncPool