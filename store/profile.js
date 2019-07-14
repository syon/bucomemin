import debug from 'debug'
import axios from 'axios'

import dataset from '~/store/dataset/Dy66.json'
import firebase from '@/classes/firebase-client'

const dg = debug('store:profile')

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
  load({ commit }, payload) {
    dg('[#load]--------')
    dg(firebase)
    const storage = firebase.storage()
    const ref = storage.ref('users/analyze/Dy66.json')
    ref
      .getDownloadURL()
      .then(url => {
        return axios.get(url)
      })
      .then(res => {
        const data = res.data
        console.log(data)
      })
    const { user } = payload
    dg({ user, dataset })
    commit('setDataset', { user, dataset })
    dg('--------[#load]')
  }
}
