import { getEmptyTask } from '../utility/tasks'
import Vue from 'vue'

export default {
  addTask(state, task) {
    Vue.set(state.tasksById, task.id, task)
  },
  addWorkspace(state, task) {
    Vue.set(state.tasksById, task.id, task)
    Vue.set(state.workspaceIds, state.workspaceIds.length - 1, state.workspaceIds)
  },
  createFirstWorkspaceTask(state) {
    const task = getEmptyTask()
    Vue.set(state.tasksById, task.id, task)

    const lastAddedWorkspaceId = state.workspaceIds.last()
    const lastAddedWorkspace = state.tasksById[lastAddedWorkspaceId]
    lastAddedWorkspace.subTaskIds.push(task.id)

    task.superTaskId = lastAddedWorkspaceId
  },
  createTask(state, description) {
    const task = getEmptyTask({ description })
    Vue.set(state.tasksById, task.id, task)
    state.detachedTask = task
  },
  createWorkspace(state) {
    const task = getEmptyTask()
    Vue.set(state.tasksById, task.id, task)
    Vue.set(state.workspaceIds, state.workspaceIds.length, task.id)
  },
  detachTask(state, id) {
    const task = state.tasksById[id]

    // get the neighbors
    const { nextTaskId, prevTaskId, superTaskId } = task
    const nextTask = state.tasksById[nextTaskId] || null
    const prevTask = state.tasksById[prevTaskId] || null
    const superTask = state.tasksById[superTaskId] || null

    // connect the neighbors
    if (nextTask) nextTask.prevTaskId = task.prevTaskId
    if (prevTask) prevTask.nextTaskId = task.nextTaskId
    if (superTask) superTask.subTaskIds.remove(id)

    task.superTaskId = null
    task.prevTaskId = null
    task.nextTaskId = null

    state.detachedTask = task
  },
  editTask(state, { id, title, progress }) {
    if (title !== undefined) state.tasksById[id].title = title
    if (progress !== undefined) state.tasksById[id].progress = progress
  },
  focusTask(state, id) {
    state.focusedTaskId = id
  },
  loadSavedTasks(state, { workspaceIds, tasksById, currentWorkspaceId }) {
    state.workspaceIds = workspaceIds
    state.tasksById = JSON.parse(tasksById)
    state.currentWorkspaceId = currentWorkspaceId
  },
  makeFirstSubTask(state, superTaskId) {
    const task = state.detachedTask
    const superTask = state.tasksById[superTaskId]

    task.superTaskId = superTaskId
    superTask.subTaskIds.push(task.id)

    state.detachedTask = null
  },
  // put the detached task after some task
  makeNextTask(state, prevTaskId) {
    const task = state.detachedTask
    const prevTask = state.tasksById[prevTaskId]
    const superTask = state.tasksById[prevTask.superTaskId]
    const nextTask = state.tasksById[prevTask.nextTaskId]

    prevTask.nextTaskId = task.id
    task.prevTaskId = prevTaskId

    if (nextTask) {
      nextTask.prevTaskId = task.id
      task.nextTaskId = nextTask.id
    }

    superTask.subTaskIds.insertAfter(prevTaskId, task.id)
    task.superTaskId = prevTask.superTaskId

    state.detachedTask = null
  },
  // put the detached task before some task
  makePrevTask(state, nextTaskId) {
    const task = state.detachedTask
    const nextTask = state.tasksById[nextTaskId]
    const superTask = state.tasksById[nextTask.superTaskId]

    if (nextTask.prevTaskId) {
      const prevTask = state.tasksById[nextTask.prevTaskId]
      prevTask.nextTaskId = task.id
      task.prevTaskId = prevTask.id
    }

    nextTask.prevTaskId = task.id
    task.nextTaskId = nextTaskId

    superTask.subTaskIds.insertBefore(nextTaskId, task.id)
    task.superTaskId = nextTask.superTaskId

    state.detachedTask = null
  },
  purgeTask(state, id) {
    state.detachedTask = null
    delete state.tasksById[id]
  },
  saveTasks({ rootId, tasksById }) {
    window.localStorage.setItem('rootId', rootId)
    window.localStorage.setItem('tasksById', JSON.stringify(tasksById))
  },
  saveWorkspaces(state) {
    window.localStorage.setItem('workspaceIds', JSON.stringify(state.workspaceIds))
    window.localStorage.setItem('currentWorkspaceId', JSON.stringify(state.currentWorkspaceId))
  },
  setCurrentWorkspaceId(state, id) {
    state.currentWorkspaceId = id
  },
  updateTask(state, { id, prop, value }) {
    state.tasksById[id][prop] = value
  },
  updateTaskProgress(state, { id, progress }) {
    state.tasksById[id].progress = progress
  },
}
