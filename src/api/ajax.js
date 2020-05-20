import axios from 'axios'

export const TYPE_GET = 'GET'
export const TYPE_POST = 'POST'

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

axios.interceptors.request.use(config => {
  // 请求头添加Authorization字段，验证token
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

export default function ajax (url = '', data = {}, type = TYPE_GET) {
  if (type === 'GET') {
    let dataStr = ''
    Object.keys(data).forEach(key => {
      dataStr += key + '=' + data[key] + '&'
    })
    if (dataStr !== '') {
      dataStr = dataStr.substr(0, dataStr.lastIndexOf('&'))
      url = url + '?' + dataStr
    }
    return axios.get(url)
  } else {
    return axios.post(url, data)
  }
}
