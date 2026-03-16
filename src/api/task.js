import request from '../utils/request'

export function clientAddTask(serials,scriptIds, time, rounds,params={}) {
  return request.post('/api/task/clientAddTask', { serials: serials, script_ids: scriptIds, time: time, rounds: rounds, params: params })
}
export function clientStopTask(serials) {
  return request.post('/api/task/clientStopTask', { serials: serials })
}