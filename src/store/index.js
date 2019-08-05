import Vue from 'vue';
import Vuex from 'vuex';
import uuid from '@/functions/uuid';
import filters from './modules/filters';
import '@/functions/array';

function getEmptyTask(seed) {
  return {
    id: uuid(),
    isProject: false,
    hasOwnBoard: false,
    superTaskId: null,
    subTaskIds: [],
    prevTaskId: null,
    nextTaskId: null,
    description: '',
    progress: 0,
    showSubtasks: false,
    ...seed,
  };
}

const root = {
  ...getEmptyTask({ showSubtasks: true, isRoot: true }),
};

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    filters,
  },
  state: {
    rootId: root.id,
    tasksById: {
      [root.id]: root,
    },
    detachedTask: null,
    focusedTaskId: null,
  },
  mutations: {
    createTask(state, description) {
      const task = getEmptyTask({ description });
      state.tasksById[task.id] = task;
      state.detachedTask = task;
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
    editTask(state, { id, description, progress }) {
      if (description !== undefined) state.tasksById[id].description = description;
      if (progress !== undefined) state.tasksById[id].progress = progress;
    },
    focusTask(state, id) {
      state.focusedTaskId = id;
    },
    purgeTask(state, id) {
      state.detachedTask = null;
      delete state.tasksById[id];
    },
    loadSavedTasks(state, { rootId, tasksById }) {
      state.rootId = rootId;
      state.tasksById = JSON.parse(tasksById);
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
    initialize({ state, dispatch, commit }) {
      const savedRootId = window.localStorage.getItem('rootId');
      const savedTasksById = window.localStorage.getItem('tasksById');
      if (savedRootId && savedTasksById) {
        commit('loadSavedTasks', {
          rootId: savedRootId,
          tasksById: savedTasksById,
        });
      } else {
        const { rootId } = state;
        dispatch('addTask', { superTaskId: rootId });
      }
    },
    addTask({ commit }, { prevTaskId, nextTaskId, superTaskId, description }) {
      commit('createTask', description);
      if (prevTaskId) commit('makeNextTask', prevTaskId);
      else if (nextTaskId) commit('makePrevTask', nextTaskId);
      else if (superTaskId) commit('makeFirstSubTask', superTaskId);

      commit('saveTasks');
    },
    editTask({ commit }, { id, description, progress }) {
      if (description !== undefined) {
        commit('editTask', { id, description });
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
    makeProject() {},
    getOwnBoard() {},
  },
});
