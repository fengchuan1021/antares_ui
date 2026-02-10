import request from '../utils/request'

export function getScriptsTree() {
  return request.get('/api/scripts_tree')
}

export function getScriptCategories() {
  return request.get('/api/script_categories')
}

export function createScriptCategory(data) {
  return request.post('/api/script_categories', data)
}

export function updateScriptCategory(id, data) {
  return request.patch(`/api/script_categories/${id}`, data)
}

export function deleteScriptCategory(id) {
  return request.delete(`/api/script_categories/${id}`)
}
