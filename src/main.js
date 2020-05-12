import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'
// 导入全局样式
import './assets/css/global.css'
// 导入字体图标
import './assets/font/iconfont.css'
import axios from 'axios'
import qs from 'qs'
import tableTree from 'vue-table-with-tree-grid'
// 配置请求根路径
axios.defaults.baseURL = 'http://test.admin.com'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios
Vue.prototype.$qs = qs
Vue.config.productionTip = false
Vue.component('tree-table', tableTree)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
