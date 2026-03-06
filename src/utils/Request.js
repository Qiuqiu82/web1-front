import axios from 'axios'
import { Loading, Message } from 'element-ui'
import config from '@/config/config'

const CONTENT_TYPE_FORM = 'application/x-www-form-urlencoded;charset=UTF-8'
const CONTENT_TYPE_JSON = 'application/json'
const RESPONSE_TYPE_JSON = 'json'

let loading = null

const instance = axios.create({
  withCredentials: true,
  baseURL: config.baseUrl,
  timeout: 10 * 1000
})

instance.interceptors.request.use(
  (config) => {
    if (config.showLoading) {
      loading = Loading.service({
        lock: true,
        text: '加载中...',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    }
    return config
  },
  (error) => {
    if (error.config && error.config.showLoading && loading) {
      loading.close()
    }
    Message.error('请求发送失败')
    return Promise.reject(error)
  }
)

instance.interceptors.response.use(
  (response) => {
    const { showLoading, errorCallback, showError = true, responseType } = response.config
    if (showLoading && loading) {
      loading.close()
    }
    const responseData = response.data

    if (responseType === 'arraybuffer' || responseType === 'blob') {
      return responseData
    }

    if (responseData && (responseData.code === 0 || responseData.code === 200)) {
      return responseData
    }

    if (responseData && (responseData.code === 401 || responseData.code === 403 || responseData.code === 901)) {
      return Promise.reject({ showError: false })
    }

    if (errorCallback) {
      errorCallback(responseData)
    }
    return Promise.reject({
      showError,
      msg: (responseData && (responseData.msg || responseData.info)) || '请求失败'
    })
  },
  (error) => {
    if (error.config && error.config.showLoading && loading) {
      loading.close()
    }
    return Promise.reject({ showError: true, msg: '网络异常' })
  }
)

const request = (config) => {
  const {
    url,
    params = {},
    method = 'post',
    dataType,
    showLoading = true,
    responseType = RESPONSE_TYPE_JSON,
    showError = true,
    errorCallback,
    uploadProgressCallback
  } = config

  const token = localStorage.getItem('Token') || localStorage.getItem('token') || ''
  const lowerMethod = method.toLowerCase()
  const isJson = dataType === 'json'

  const headers = {
    'X-Requested-With': 'XMLHttpRequest',
    token,
    Token: token
  }

  let reqPromise
  if (lowerMethod === 'get') {
    reqPromise = instance.get(url, {
      params,
      responseType,
      headers,
      showLoading,
      errorCallback,
      showError
    })
  } else {
    let body = null
    if (isJson) {
      headers['Content-Type'] = CONTENT_TYPE_JSON
      body = params
    } else {
      headers['Content-Type'] = CONTENT_TYPE_FORM
      const formData = new FormData()
      Object.keys(params).forEach((key) => {
        formData.append(key, params[key] == null ? '' : params[key])
      })
      body = formData
    }
    reqPromise = instance.post(url, body, {
      onUploadProgress: (event) => {
        if (uploadProgressCallback) {
          uploadProgressCallback(event)
        }
      },
      responseType,
      headers,
      showLoading,
      errorCallback,
      showError
    })
  }

  return reqPromise.catch((error) => {
    if (error.showError) {
      Message.error(error.msg)
    }
    return null
  })
}

export default request