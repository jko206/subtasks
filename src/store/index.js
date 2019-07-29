import Vue from 'vue';
import Vuex from 'vuex';
import uuid from '@/functions/uuid';

Array.prototype.last = function() {
  return this[this.length - 1];
};

Array.prototype.remove = function(elem) {
  const i = this.indexOf(elem);
  this.splice(i, 1);
};

Array.prototype.insertAfter = function(aboutElem, newElem) {
  const idx = this.indexOf(aboutElem);
  this.splice(idx + 1, 0, newElem);
};

Array.prototype.insertBefore = function(aboutElem, newElem) {
  const idx = this.indexOf(aboutElem);
  this.splice(idx, 0, newElem);
};

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
  ...getEmptyTask({ showSubtasks: true }),
};

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    root,
    tasksById: {
      [root.id]: root,
    },
    detachedTask: null,
    rootId: root.id,
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
    editTask(state, { id, description }) {
      state.tasksById[id].description = description;
    },
  },
  actions: {
    addTask({ commit }, { prevTaskId, nextTaskId, superTaskId, description }) {
      commit('createTask', description);
      if (prevTaskId) commit('makeNextTask', prevTaskId);
      else if (nextTaskId) commit('makePrevTask', nextTaskId);
      else if (superTaskId) commit('makeFirstSubTask', superTaskId);

      commit('save');
    },
    editTask({ commit }, { id, description }) {
      if (description) {
        commit('editTask', { id, description });
      }
    },
    removeTask({ state }, { id }) {
      const task = state.tasksById[id];
      const { superTask, prevTask, nextTask } = task;

      // disconnect from superTask
      const arrayToBeRemovedFrom = (superTask && superTask.subTasks) || state.rootTasks;
      const taskIdx = arrayToBeRemovedFrom.indexOf(task);
      arrayToBeRemovedFrom.splice(taskIdx, 1);

      // disconnect from taskmates
      if (prevTask && nextTask) {
        prevTask.nextTask = nextTask;
        nextTask.prevTask = prevTask;
      } else {
        if (prevTask) prevTask.nextTask = null;
        if (nextTask) nextTask.prevTask = null;
      }

      delete state.tasksById[id];
    },
    reorderTask() {}, // moves tasks up/down

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
    },
    makeNextTask({ commit }, { id, prevTaskId }) {
      commit('detachTask', id);
      commit('makeNextTask', prevTaskId);
    },
    makeProject() {},
    getOwnBoard() {},
  },
});
