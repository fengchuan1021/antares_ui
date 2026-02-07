import request from '../utils/request'

export function saveApplications(apps) {
  return request.post('/api/applications', { apps })
}
