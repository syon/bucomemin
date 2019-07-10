import debug from 'debug'

import dataset from '~/store/dataset/Dy66.json'

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
    const { user } = payload
    dg({ user, dataset })
    commit('setDataset', { user, dataset })
    dg('--------[#load]')
  }
}
