import debug from 'debug'
import axios from 'axios'

import firebase from '@/classes/firebase-client'

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
  orderScrape(_, payload) {
    const { user } = payload
    // const res = await axios.get(`/hello?user=${user}`)
    window.location = `/hello?user=${user}`
  },
  async detectDatasetURL({ commit }, payload) {
    const { user } = payload
    const storage = firebase.storage()
    const ref = storage.ref(`users/analyze/${user}.json`)
    const url = await ref.getDownloadURL().catch(e => {
      dg(e)
      return ''
    })
    const dataset = await axios.get(url).then(res => {
      return res.data
    })
    commit('setDataset', dataset)
    dg(url)
    return url
  }
}
