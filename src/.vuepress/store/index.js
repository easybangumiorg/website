import Vuex from 'vuex'
import Vue from 'vue'

const RELEASE_API = "https://api.github.com/repos/easybangumiorg/EasyBangumi/releases/latest"
Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        stable: {
            updated: null,
            data: null,
        },
    },
    mutations: {
        setStableReleaseData(state, data) {
            // eslint-disable-next-line no-param-reassign
            state.stable = {
                updated: new Date().getTime(),
                data: data,
            };
        },
    },
    actions: {
        getStableReleaseData() {
            const { updated } = this.state.stable;
            const now = new Date().getTime();

            if (updated != null && now - updated <= 60 * 60 * 24 * 1000) {
                return Promise.resolve(this.state.stable.data);
            }

            return new Promise((resolve, reject) => {
                fetch(RELEASE_API)
                    .then(res => res.json())
                    .then(res => {
                        this.commit("setStableReleaseData", res)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
    },
});