import axios from 'axios'

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

export const TYPE_GET = 'GET'

export const TYPE_POST = 'POST'

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
