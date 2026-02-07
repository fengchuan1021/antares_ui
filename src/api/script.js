import request from '../utils/request'

export function getScriptsTree() {
  return request.get('/api/scripts_tree')
}
