import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        operation: ''
    },
    mutations: {
        SET_OPERATION: (state, payload) => {
            state.operation = payload
        }
    },
    actions: {},
    getters: {}
})