import request from '../utils/request'

export function getQuNaTaskSummaryList() {
  return request.post('/api/third/getQuNaTaskSummaryList')
}

export function uploadQuNaTask(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/api/third/uploadQuNaTask', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
