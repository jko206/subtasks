const state = {
  showOnlyLeafSubTasks: false,
  showInProgressTasks: true,
  showCompletedTasks: true,
  showNotStartedTasks: true,
}

const mutations = {
  toggleOnlyLeafSubTasks(state, isShown) {
    state.showOnlyLeafSubTasks = isShown === !!isShown ? isShown : !state.showOnlyLeafSubTasks
  },
  toggleInProgressTasks(state, isShown) {
    state.showInProgressTasks = isShown === !!isShown ? isShown : !state.showInProgressTasks
  },
  toggleCompletedTasks(state, isShown) {
    state.showCompletedTasks = isShown === !!isShown ? isShown : !state.showCompletedTasks
  },
  toggleNotStartedTasks(state, isShown) {
    state.showNotStartedTasks = isShown === !!isShown ? isShown : !state.showNotStartedTasks
  },
}

const actions = {}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
