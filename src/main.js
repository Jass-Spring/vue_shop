import Vue from 'vue'
import axios from 'axios'

import './plugins/axios.js'
import './plugins/element.js'
import './plugins/treeTable.js'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import router from './router'
import App from './App.vue'

Vue.prototype.$http = axios

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
