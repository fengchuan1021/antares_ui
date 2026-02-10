import request from '../utils/request'

export function getApplications() {
  return request.get('/api/applications')
}

export function saveApplications(apps) {
  return request.post('/api/applications', { apps })
}
