import Vue from 'vue'
import Vuex from 'vuex'
import taskFilters from './task-filters'
import '@/utility/array'
import mutations from "mutations";
import actions from "actions";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    workspaceIds: [], // IDs of workspaces
    tasksById: {},
    detachedTask: null,
    focusedTaskId: null,
    currentWorkspaceId: null,
  },
  modules: {
    taskFilters,
  },
  mutations,
  actions,
})
