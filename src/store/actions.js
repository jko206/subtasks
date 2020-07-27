export default {
  initialize({ commit, dispatch }) {
    const savedWorkspaces = window.localStorage.getItem('workspaceIds')
    const savedTasksById = window.localStorage.getItem('tasksById')
    const currentWorkspaceId = window.localStorage.getItem('currentWorkspaceId')
    if (savedWorkspaces && savedTasksById && currentWorkspaceId) {
      commit('loadSavedTasks', {
        workspaceIds: JSON.parse(savedWorkspaces),
        tasksById: savedTasksById,
        currentWorkspaceId: JSON.parse(currentWorkspaceId),
      })
    } else {
      dispatch('addWorkspace')
    }
  },
  addWorkspace({ commit }) {
    commit('createWorkspace')
    commit('createFirstWorkspaceTask')
    commit('saveWorkspaces')
  },
  addTask({ commit }, { prevTaskId, nextTaskId, superTaskId, description }) {
    commit('createTask', description)
    if (prevTaskId) commit('makeNextTask', prevTaskId)
    else if (nextTaskId) commit('makePrevTask', nextTaskId)
    else if (superTaskId) commit('makeFirstSubTask', superTaskId)

    commit('saveTasks')
  },
  editTask({ commit }, { id, title, progress }) {
    if (title !== undefined) {
      commit('editTask', { id, title })
    }

    if (progress !== undefined) {
      commit('editTask', { id, progress })
    }

    commit('saveTasks')
  },
  removeTask({ commit, state }, id) {
    const { tasksById, rootId } = state
    const task = tasksById[id]
    const { prevTaskId, nextTaskId, superTaskId } = task
    const isOnlyTask = !prevTaskId && !nextTaskId && superTaskId === rootId
    if (!isOnlyTask) {
      commit('detachTask', id)
      commit('purgeTask', id)
    }

    commit('saveTasks')
  },

  // becomes a subtask of its previous task
  makeSubTask({ state, commit }, { id, superTaskId }) {
    commit('detachTask', id)
    const superTask = state.tasksById[superTaskId]
    if (superTask.subTaskIds.length) {
      const prevTaskId = superTask.subTaskIds.last()
      commit('makeNextTask', prevTaskId)
    } else {
      commit('makeFirstSubTask', superTaskId)
    }

    commit('saveTasks')
  },
  makeNextTask({ commit }, { id, prevTaskId }) {
    commit('detachTask', id)
    commit('makeNextTask', prevTaskId)

    commit('saveTasks')
  },
  markSubTasksAsDone({ commit, state }, { id, progress }) {
    const queue = [id]
    while (queue.length) {
      const taskId = queue.shift()
      const task = state.tasksById[taskId]

      commit('updateTaskProgress', {
        id: taskId,
        progress,
      })

      if (task.subTaskIds.length) queue.push(...task.subTaskIds)
    }
  },
  updateSuperTaskProgress({ state, commit, dispatch }, id) {
    const { subTaskIds, superTaskId } = state.tasksById[id]
    const total = subTaskIds.length
    let progress = subTaskIds
      .map((subTaskId) => state.tasksById[subTaskId])
      .reduce((subTotal, task) => subTotal + task.progress, 0)

    progress /= total
    commit('updateTaskProgress', { id, progress })

    if (superTaskId) dispatch('updateSuperTaskProgress', superTaskId)
  },
},