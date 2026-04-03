import request from '../utils/request'

export function backupApps(serial,pkgs) {
  return request.post('/api/backup/backupApps', { serial: serial, pkgs: pkgs })
}
export function listBackups(serial) {
  return request.post('/api/backup/listBackups', { serial: serial })
}