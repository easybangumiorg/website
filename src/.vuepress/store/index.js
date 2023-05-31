import { createStore } from 'vuex'

const RELEASE_API = "https://api.github.com/repos/easybangumiorg/EasyBangumi/releases/latest"
const NIGHTLY_API = "https://api.github.com/repos/easybangumiorg/EasyBangumi-nightly/releases/latest"

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
        getNightlyData(store, name) {
            return new Promise((resolve, reject) => {
                _getData(store, name, "setNightlyReleaseData", NIGHTLY_API)
                    .then(() => {
                        resolve(store.state.nightly.data)
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
            nightly: {
                updated: null,
                data: null,
            },
            distributive: {
                path: null,
                isConnect: false,
                meta: null,
                server: null,
                secret: null,
            },
            source: {
                list: {},
                isLoaded: false,
                choose: null,
                count: 0
            },
            contentStack: [
                {
                    type: "blank",
                    source: "official",
                    title: "分布式纯纯看番",
                    text: "此页面仅供链接分布式纯纯看番使用，任何内容均与纯纯看番无关，纯纯看番仅提供相应的接口规范和标准程序实现，并不存储且分发相应的内容。"
                }
            ],
            contentCanBackward: true
        }
    },
    mutations: {
        setStableReleaseData(state, data) {
            state.stable = {
                updated: new Date().getTime(),
                data: data,
            }
        },
        setNightlyReleaseData(state, data) {
            state.nightly = {
                updated: new Date().getTime(),
                data: data,
            }
        },
        setDistributive(state, data) {
            state.distributive = data
        },
        setSource(state, data) {
            state.source = data
        },
        pushContent(state, content) {
            const last = state.contentStack[state.contentStack.length - 1]

            if (last.type == content.type
                && last.source == content.source
                && last.title == content.title) {
                return
            }

            state.contentStack.push(content)
            state.contentCanBackward = true
        },
        popContent(state) {
            if (state.contentStack.length > 1) {
                state.contentStack.pop()
            }
            if (state.contentStack.length == 1) {
                state.contentCanBackward = false
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
        getNightlyReleaseData() {
            const { updated } = this.state.nightly;
            const now = new Date().getTime();

            if (updated != null && now - updated <= 60 * 60 * 24 * 1000) {
                return Promise.resolve(this.state.nightly.data);
            }

            return worker.getNightlyData(this, "nightly")
        },
        getSourceList() {
            if (this.state.source.isLoaded) {
                return this.state.source.list
            }
            return fetch(`${this.state.distributive.path}/list`)
                .then(res => res.json())
                .then(res => {
                    let choose = null
                    let a = 0
                    for (let i in res.data) {
                        if (!choose) {
                            choose = i
                        }
                        a += 1
                    }

                    this.commit('setSource', {
                        list: res.data,
                        isLoaded: true,
                        count: a,
                        choose
                    })

                    return res.data
                })
                .catch(err => {
                    console.log(err)
                })
        },
        chooseSource(store, source) {
            if (!source in this.state.source.list) {
                console.warn("A non-existent source was selected")
                return
            }
            store.commit('setSource', {
                ...store.state.source,
                choose: source
            })
        },
        openContent(store, content) {
            store.commit('pushContent', content)
        },
        backwardContent(store) {
            store.commit('popContent')
        }
    },
    getters: {
        content(state) {
            return state.contentStack[state.contentStack.length - 1]
        }
    }
})