import 'babel-polyfill'
import Vue from 'vue'
import App from './App.vue'
import vueCookie from 'vue-cookie'
import routes from './router/index'
import VueRouter from 'vue-router'
import store from './store/index'
import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'
import NProgress from 'nprogress' // Progress 进度条
import 'nprogress/nprogress.css'// Progress 进度条样式
import Vuex from "vuex";
Vue.use(vueCookie);
Vue.use(ElementUI);
Vue.use(Vuex)
Vue.use(VueRouter)

Vue.config.productionTip = false

const router = new VueRouter({
  mode: 'hash',
  routes
})

window.router = router
window.bus = new Vue(
  {
    router,
    store,
  }
);
router.afterEach(() => {
  NProgress.done() // 结束Progress
})


router.beforeResolve(async (to, from, next) => {
  next()
})

new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: {App}
})
