import Vue from 'vue'

import './plugins/element.js'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import router from './router'
import App from './App.vue'

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
