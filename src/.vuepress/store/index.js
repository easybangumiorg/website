import { createStore } from 'vuex'

const RELEASE_API = "https://api.github.com/repos/easybangumiorg/EasyBangumi/releases/latest"

const worker = (function () {
    const networkMap = new Map()

    function _getDataFromGithub(name, url) {
        if (networkMap.has(name)) {
            return networkMap.get(name)
        }

        const call = fetch(url)
            .then(res => res.json())
            .then(res => {
                networkMap.delete(name)
                return res
            })
            .catch((err) => {
                networkMap.delete(name)
                return err
            })

        networkMap.set(name, call)

        return call
    }

    const dataMap = new Map()

    function _getData(store, name, type, url) {
        if (dataMap.has(name)) {
            return dataMap.get(name)
        }

        const promise = _getDataFromGithub(name, url)
            .then(res => {
                store.commit(type, res)
                dataMap.delete(name)
                return res
            })
            .catch(err => {
                store.commit(type, null)
                dataMap.delete(name)
                return err
            })

        dataMap.set(name, promise)

        return promise
    }

    return {
        getStableData(store, name) {
            return new Promise((resolve, reject) => {
                _getData(store, name, "setStableReleaseData", RELEASE_API)
                    .then(() => {
                        resolve(store.state.stable.data)
                    })
                    .catch((reason) => {
                        reject(reason)
                    })
            })
        },
    }
})()

export default createStore({
    state() {
        return {
            stable: {
                updated: null,
                data: null,
            },
        }
    },
    mutations: {
        setStableReleaseData(state, data) {
            state.stable = {
                updated: new Date().getTime(),
                data: data,
            }
        },
    },
    actions: {
        getStableReleaseData() {
            const { updated } = this.state.stable;
            const now = new Date().getTime();

            if (updated != null && now - updated <= 60 * 60 * 24 * 1000) {
                return Promise.resolve(this.state.stable.data);
            }

            return worker.getStableData(this, "stable")
        },
    },
})