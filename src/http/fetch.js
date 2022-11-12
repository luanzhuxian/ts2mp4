import fetch, { Request, Headers } from 'node-fetch'
import AbortController from 'abort-controller'
import { FormData } from 'formdata-polyfill/esm.min.js'
import qs from 'qs'

// const fetch = require('node-fetch')
// const AbortController = require('abort-controller')
// const { FormData } = require('formdata-polyfill/esm-min.js')
// const qs = require('qs')
const CreateRequest = Symbol('create-req')
const CreateHeaders = Symbol('create-headers')
const request = Symbol('request')

class Fetch {
  /**
   * 可选择的默认配置项，多余选项会被忽略
   * @type {{headers: {}, baseURI: string, model: string, type: string, timeout: number}}
   */
  defaultConfig = {
    headers: {}, // 一个对象，可包含请求头中的相关属性
    model: 'same-origin',
    baseURI: '',
    timeout: 0 // 超时时间
  }
  interceptors = {
    request: null,
    response: null
  }
  timer = 0
  /**
   * 构造函数
   * @param config {object} 默认配置
   * @property config.headers {object} 默认的请求头
   * @property config.timeout {number} 请求超时时间
   */
  constructor (config) {
    Object.assign(this.defaultConfig, config)
  }
  /**
   * 请求，所有方法同下
   * @param config {object} 发起请求的时候传入的配置，参数同 defaultConfig
   */
  async get (url, config = {}) {
    config.method = 'GET'
    return this[request](url, null, config)
  }
  async post (url, body, config = {}) {
    body = body || null
    config.method = 'POST'
    return this[request](url, body, config)
  }
  async put (url, body, config = {}) {
    body = body || {}
    config.method = 'PUT'
    return this[request](url, body, config)
  }
  async delete (url, body, config = {}) {
    body = body || {}
    config.method = 'DELETE'
    return this[request](url, body, config)
  }
  async update (url, body, config = {}) {
    body = body || {}
    config.method = 'UPDATE'
    return this[request](url, body, config)
  }
  // 请求对象
  async [request] (url, body, config = {}) {
    // 配置请求拦截器
    if (this.interceptors.request) {
      // 拦截器通过则返回 config
      config = this.interceptors.request(url, config)
    }
    if (config.params) {
      url += `?${qs.stringify(config.params)}`
      delete config.params
    }
    const request = this[CreateRequest](url, body, config)
    try {
      let response
      if (this.interceptors.response) {
        // TODO:
        // 发送请求，同时将返回数据传入响应拦截器
        response = await fetch(request)
        // response = response[config.responseType || 'json']() // res = await res.json()
        response = await this.interceptors.response(response, config)
      } else {
        response = await fetch(request)
      }
      return response
    } catch (e) {
      throw e
    } finally {
      clearTimeout(this.timer)
    }
  }
  /**
   * 根据现有配置，创建一个request对象
   * @param url {string} 请求地址
   * @param body {object} 数据
   * @param config {object} 配置
   * @property config.method
   * @property config.headers
   * @property config.body
   * @property config.mode
   * @property config.credentials
   * @property config.cache
   * @property config.redirect
   * @property config.referrer
   * @property config.integrity
   * @property config.signal {AbortSignal}
   * @return {Request}
   */
  [CreateRequest] (url, body, config = {}) {
    const defaultConfig = this.copyObject(this.defaultConfig)

    // 用来终止请求的对象
    const controller = new AbortController()

    Object.assign(defaultConfig.headers || {}, config.headers)
    delete config.headers
    Object.assign(defaultConfig, config)

    // 处理 body
    if (defaultConfig.type === 'FormData' && body) {
      let b = new FormData()
      for (let [k, v] of Object.entries(body)) {
        b.append(k, v)
      }
      defaultConfig.body = b
      // formData 类型不需要传 Content-Type
      delete defaultConfig.headers['Content-Type']
    } else if (body) {
      defaultConfig.body = JSON.stringify(body)
    }

    // 生成 Headers 对象
    // 替换 config 中的 headers 对象为新构建的 header 对象
    defaultConfig.headers = this[CreateHeaders](defaultConfig.headers)
    // signal 返回一个 AbortSignal 对象实例，它可以用来 with/abort 一个 Web 网络请求
    defaultConfig.signal = controller.signal
    url = (defaultConfig.baseURI || '') + url

    // 如果超时，就终止请求，终止后，错误会在 catch 中捕获
    if (defaultConfig.timeout > 0) {
      this.timer = setTimeout(() => {
        controller.abort()
      }, defaultConfig.timeout)
    }
    return new Request(url, defaultConfig)
  }
  /**
   * 创建Headers对象
   * @param headers {Object}
   * @return {Headers}
   */
  [CreateHeaders] (headers = {}) {
    const HEADERS = new Headers()
    for (let key of Object.keys(headers)) {
      HEADERS.append(key, headers[key])
    }
    return HEADERS
  }
  copyObject (obj = {}) {
    return JSON.parse(JSON.stringify(obj))
  }
}

export default Fetch