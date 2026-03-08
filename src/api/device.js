import request from '../utils/request'

export function searchDevices(serial) {
  return request.get('/api/devices', { params: { serial } })
}

export function updateDevice(id, data) {
  return request.patch(`/api/devices/${id}`, data)
}
export function getDeviceExpireTime(serial){
  return request.get(`/api/devices/expireTime?serial=${serial}`)
}