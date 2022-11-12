import Fetch from './fetch.js'

const fetch = new Fetch({
//   headers: {
//     'Content-Type': 'application/json'
//   },
  timeout: 15000
})

fetch.interceptors.request = (url, config) => {
  return config
}

fetch.interceptors.response = async (resPromise, config) => {
  try {
      console.log(111, resPromise)
      const res = await resPromise
      console.log(222, res)
    if (res instanceof Blob) {
      return res
    }
    // if (res.status !== 200) {
    //   throw new Error(res.devMessage || res.message)
    // }
    return res
  } catch (e) {
    throw e
  }
}

export default fetch