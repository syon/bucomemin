import debug from 'debug'

import firebase from '@/classes/firebase-client'

const dg = debug('app:store:profile')

export const state = () => ({
  dataset: {}
})

export const getters = {}

export const mutations = {
  setDataset(state, { dataset }) {
    state.dataset = dataset
  }
}

export const actions = {
  orderScrape(_, payload) {
    const { user } = payload
    // const res = await axios.get(`/hello?user=${user}`)
    window.location = `/hello?user=${user}`
  },
  async detectDatasetURL(_, payload) {
    const { user } = payload
    const storage = firebase.storage()
    const ref = storage.ref(`users/analyze/${user}.json`)
    const url = await ref.getDownloadURL().catch(e => {
      dg(e)
      return ''
    })
    dg(url)
    return url
  }
}
