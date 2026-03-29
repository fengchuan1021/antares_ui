import request from '../utils/request'

export function searchDevices(serial) {
  return request.get('/api/devices', { params: { serial } })
}

/** 列出当前账号可见的全部设备（需传 all=1） */
export function listDevices() {
  return request.get('/api/devices', { params: { all: 1 } })
}

export function updateDevice(id, data) {
  return request.patch(`/api/devices/add_device_expire_time/${id}`, data)
}
export function getDeviceExpireTime(serial){
  return request.get(`/api/devices/expireTime?serial=${serial}`)
}