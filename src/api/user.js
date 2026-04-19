import request from '../utils/request'

export function login(username, password) {
  return request.post('/api/user/login', { username, password })
}
export function loginWithSerial(serial) {
  return request.post('/api/user/loginWithSerial', { serial })
}
export function register(username, password) {
  return request.post('/api/user/register', { username, password })
}
export function getUserProfile() {
  return request.get('/api/user/profile')
}

export function createUser(username, password) {
  return request.post('/api/user', { username, password })
}
export function activateUser(username) {
  return request.post('/api/user/activate', { username })
}
export function getIpGroupLimit(uid) {
  return request.get(`/api/user/get_ip_group_limit?uid=${uid}`)
}
export function saveIpGroupLimit(uid, ipGroupLimit) {
  return request.post(`/api/user/save_ip_group_limit?uid=${uid}`, { max_devices_per_ip: ipGroupLimit })
}