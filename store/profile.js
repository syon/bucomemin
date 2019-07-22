import debug from 'debug'
import axios from 'axios'

import fb from '@/classes/firebase-client'

const dg = debug('app:store:profile')

export const state = () => ({
  commentRate: 0,
  starredRate: 0,
  anondRate: 0
})

export const getters = {}

export const mutations = {
  setDataset(state, payload) {
    state.commentRate = payload.commentRate
    state.starredRate = payload.starredRate
    state.anondRate = payload.anondRate
  }
}

export const actions = {
  async addOrder(_, payload) {
    const { user } = payload
    const obj = {
      timestamp: new Date().getTime()
    }
    await fb.db
      .doc(`orders/${user}`)
      .set(obj)
      .catch(e => {
        console.error(e)
      })
  },
  async fetchDataset({ commit }, payload) {
    const { user } = payload
    const ref = fb.storage.ref(`analyze/${user}.json`)
    const url = await ref.getDownloadURL().catch(e => {
      dg(e)
      return ''
    })
    const dataset = await axios.get(url).then(res => {
      return res.data
    })
    commit('setDataset', dataset)
  },
  async detectDatasetURL(_, payload) {
    const { user } = payload
    const ref = fb.storage.ref(`calendar/${user}.json`)
    const url = await ref.getDownloadURL().catch(e => {
      dg(e)
      return ''
    })
    dg(url)
    return url
  }
}
