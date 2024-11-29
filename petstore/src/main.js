import Vue from 'vue'
import App from './App'
import router from './router'
import Vuex from 'vuex'

require('./assets/app.css')

Vue.config.productionTip = false

Vue.use(Vuex) // Vue에 Vuex 사용 설정

export const store = new Vuex.Store({
  state: {
    products: []
  },
  mutations: {
    'SET_STORE'(state, products) {
      state.products = products;
    }
  }
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
});
