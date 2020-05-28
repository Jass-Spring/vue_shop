import axios from 'axios'

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

axios.interceptors.request.use(config => {
  // 请求头添加Authorization字段，验证token
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
