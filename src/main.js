import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css'
import './style.css'
import App from './App.vue'
import router from './router'

if (typeof Object.hasOwn !== 'function') {
  Object.hasOwn = function hasOwn(target, key) {
    return Object.prototype.hasOwnProperty.call(target, key)
  }
}

if (typeof String.prototype.replaceAll !== 'function') {
  String.prototype.replaceAll = function replaceAll(searchValue, replaceValue) {
    const str = String(this)
    if (searchValue instanceof RegExp) {
      if (!searchValue.global) {
        throw new TypeError(
          'String.prototype.replaceAll called with a non-global RegExp argument'
        )
      }
      return str.replace(searchValue, replaceValue)
    }
    const search = String(searchValue)
    if (search === '') {
      let out =
        typeof replaceValue === 'function'
          ? replaceValue('', 0, str)
          : String(replaceValue)
      for (let i = 0; i < str.length; i++) {
        out += str[i]
        out +=
          typeof replaceValue === 'function'
            ? replaceValue('', i + 1, str)
            : String(replaceValue)
      }
      return out
    }
    let result = ''
    let pos = 0
    while (true) {
      const idx = str.indexOf(search, pos)
      if (idx === -1) {
        result += str.slice(pos)
        break
      }
      result += str.slice(pos, idx)
      result +=
        typeof replaceValue === 'function'
          ? replaceValue(search, idx, str)
          : String(replaceValue)
      pos = idx + search.length
    }
    return result
  }
}

createApp(App)
  .use(createPinia())
  .use(router)
  .use(PrimeVue, {
    theme: {
      preset: Aura,
      options: { darkModeSelector: '.dark' }
    }
  })
  .use(ToastService)
  .mount('#app')
