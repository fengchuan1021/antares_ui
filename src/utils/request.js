import axios from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10000
})

// 请求拦截器：在每个请求头中添加 token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.token = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器：统一处理错误
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    return Promise.reject(error)
  }
)

export default request
