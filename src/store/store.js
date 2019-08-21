import '@/functions/array';
import { getEmptyTask } from '@/functions/tasks';
import Vue from 'vue';

export default {
  state: {
    workspaceIds: [], // IDs of workspaces
    tasksById: {},
    detachedTask: null,
    focusedTaskId: null,
    currentWorkspaceId: null,
  },
  mutations: {
    createWorkspace(state) {
      const task = getEmptyTask();
      Vue.set(state.tasksById, task.id, task);
      Vue.set(state.workspaceIds, state.workspaceIds.length, task.id);
    },
    createFirstWorkspaceTask(state) {
      const task = getEmptyTask();
      Vue.set(state.tasksById, task.id, task);

      const lastAddedWorkspaceId = state.workspaceIds.last();
      const lastAddedWorkspace = state.tasksById[lastAddedWorkspaceId];
      lastAddedWorkspace.subTaskIds.push(task.id);

      task.superTaskId = lastAddedWorkspaceId;
    },
    createTask(state, description) {
      const task = getEmptyTask({ description });
      Vue.set(state.tasksById, task.id, task);
      state.detachedTask = task;
    },

    setCurrentWorkspaceId(state, id) {
      state.currentWorkspaceId = id;
    },

    saveWorkspaces(state) {
      window.localStorage.setItem('workspaceIds', JSON.stringify(state.workspaceIds));
      window.localStorage.setItem('currentWorkspaceId', JSON.stringify(state.currentWorkspaceId));
    },

    updateTask(state, { id, prop, value }) {
      state.tasksById[id][prop] = value;
    },

    detachTask(state, id) {
      const task = state.tasksById[id];

      // get the neighbors
      const { nextTaskId, prevTaskId, superTaskId } = task;
      const nextTask = state.tasksById[nextTaskId] || null;
      const prevTask = state.tasksById[prevTaskId] || null;
      const superTask = state.tasksById[superTaskId] || null;

      // connect the neighbors
      if (nextTask) nextTask.prevTaskId = task.prevTaskId;
      if (prevTask) prevTask.nextTaskId = task.nextTaskId;
      if (superTask) superTask.subTaskIds.remove(id);

      task.superTaskId = null;
      task.prevTaskId = null;
      task.nextTaskId = null;

      state.detachedTask = task;
    },
    // put the detached task before some task
    makePrevTask(state, nextTaskId) {
      const task = state.detachedTask;
      const nextTask = state.tasksById[nextTaskId];
      const superTask = state.tasksById[nextTask.superTaskId];

      if (nextTask.prevTaskId) {
        const prevTask = state.tasksById[nextTask.prevTaskId];
        prevTask.nextTaskId = task.id;
        task.prevTaskId = prevTask.id;
      }

      nextTask.prevTaskId = task.id;
      task.nextTaskId = nextTaskId;

      superTask.subTaskIds.insertBefore(nextTaskId, task.id);
      task.superTaskId = nextTask.superTaskId;

      state.detachedTask = null;
    },
    // put the detached task after some task
    makeNextTask(state, prevTaskId) {
      const task = state.detachedTask;
      const prevTask = state.tasksById[prevTaskId];
      const superTask = state.tasksById[prevTask.superTaskId];
      const nextTask = state.tasksById[prevTask.nextTaskId];

      prevTask.nextTaskId = task.id;
      task.prevTaskId = prevTaskId;

      if (nextTask) {
        nextTask.prevTaskId = task.id;
        task.nextTaskId = nextTask.id;
      }

      superTask.subTaskIds.insertAfter(prevTaskId, task.id);
      task.superTaskId = prevTask.superTaskId;

      state.detachedTask = null;
    },
    makeFirstSubTask(state, superTaskId) {
      const task = state.detachedTask;
      const superTask = state.tasksById[superTaskId];

      task.superTaskId = superTaskId;
      superTask.subTaskIds.push(task.id);

      state.detachedTask = null;
    },
    editTask(state, { id, title, progress }) {
      if (title !== undefined) state.tasksById[id].title = title;
      if (progress !== undefined) state.tasksById[id].progress = progress;
    },
    focusTask(state, id) {
      state.focusedTaskId = id;
    },
    purgeTask(state, id) {
      state.detachedTask = null;
      delete state.tasksById[id];
    },
    loadSavedTasks(state, { workspaceIds, tasksById, currentWorkspaceId }) {
      state.workspaceIds = workspaceIds;
      state.tasksById = JSON.parse(tasksById);
      state.currentWorkspaceId = currentWorkspaceId;
    },
    saveTasks({ rootId, tasksById }) {
      window.localStorage.setItem('rootId', rootId);
      window.localStorage.setItem('tasksById', JSON.stringify(tasksById));
    },
    updateTaskProgress(state, { id, progress }) {
      state.tasksById[id].progress = progress;
    },
  },
  actions: {
    initialize({ commit, dispatch }) {
      const savedWorkspaces = window.localStorage.getItem('workspaceIds');
      const savedTasksById = window.localStorage.getItem('tasksById');
      const currentWorkspaceId = window.localStorage.getItem('currentWorkspaceId');
      if (savedWorkspaces && savedTasksById && currentWorkspaceId) {
        commit('loadSavedTasks', {
          workspaceIds: JSON.parse(savedWorkspaces),
          tasksById: savedTasksById,
          currentWorkspaceId: JSON.parse(currentWorkspaceId),
        });
      } else {
        dispatch('addWorkspace');
      }
    },
    addWorkspace({ commit }) {
      commit('createWorkspace');
      commit('createFirstWorkspaceTask');
      commit('saveWorkspaces');
    },
    addTask({ commit }, { prevTaskId, nextTaskId, superTaskId, description }) {
      commit('createTask', description);
      if (prevTaskId) commit('makeNextTask', prevTaskId);
      else if (nextTaskId) commit('makePrevTask', nextTaskId);
      else if (superTaskId) commit('makeFirstSubTask', superTaskId);

      commit('saveTasks');
    },
    editTask({ commit }, { id, title, progress }) {
      if (title !== undefined) {
        commit('editTask', { id, title });
      }

      if (progress !== undefined) {
        commit('editTask', { id, progress });
      }

      commit('saveTasks');
    },
    removeTask({ commit, state }, id) {
      const { tasksById, rootId } = state;
      const task = tasksById[id];
      const { prevTaskId, nextTaskId, superTaskId } = task;
      const isOnlyTask = !prevTaskId && !nextTaskId && superTaskId === rootId;
      if (!isOnlyTask) {
        commit('detachTask', id);
        commit('purgeTask', id);
      }

      commit('saveTasks');
    },

    // becomes a subtask of its previous task
    makeSubTask({ state, commit }, { id, superTaskId }) {
      commit('detachTask', id);
      const superTask = state.tasksById[superTaskId];
      if (superTask.subTaskIds.length) {
        const prevTaskId = superTask.subTaskIds.last();
        commit('makeNextTask', prevTaskId);
      } else {
        commit('makeFirstSubTask', superTaskId);
      }

      commit('saveTasks');
    },
    makeNextTask({ commit }, { id, prevTaskId }) {
      commit('detachTask', id);
      commit('makeNextTask', prevTaskId);

      commit('saveTasks');
    },
    markSubTasksAsDone({ commit, state }, { id, progress }) {
      const queue = [id];
      while (queue.length) {
        const taskId = queue.shift();
        const task = state.tasksById[taskId];

        commit('updateTaskProgress', {
          id: taskId,
          progress,
        });

        if (task.subTaskIds.length) queue.push(...task.subTaskIds);
      }
    },
    updateSuperTaskProgress({ state, commit, dispatch }, id) {
      const { subTaskIds, superTaskId } = state.tasksById[id];
      const total = subTaskIds.length;
      let progress = subTaskIds
        .map(subTaskId => state.tasksById[subTaskId])
        .reduce((subTotal, task) => subTotal + task.progress, 0);

      progress /= total;
      commit('updateTaskProgress', { id, progress });

      if (superTaskId) dispatch('updateSuperTaskProgress', superTaskId);
    },
  },
};
