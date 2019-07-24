import Vue from 'vue';
import Vuex from 'vuex';
import uuid from '@/functions/uuid';

Array.prototype.last = function() {
  return this[this.length - 1];
};

const emptyTask = {
  id: null,
  isProject: false,
  isNew: true,
  hasOwnBoard: false,
  superTaskId: null,
  subTaskIds: [],
  prevTaskId: null,
  nextTaskId: null,
  description: '',
  progress: 0,
  showSubtasks: false,
};

const root = {
  ...emptyTask,
  id: uuid(),
  showSubtasks: true,
};

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    root,
    tasksById: {
      [root.id]: root,
    },
  },
  actions: {
    // Things that can be added: Project, task
    // Things can be either
    addTask({ state }, newTask) {
      const { superTaskId, prevTaskId, description } = newTask;
      const id = uuid();
      const task = {
        ...emptyTask,
        superTaskId,
        prevTaskId,
        description,
        id,
      };

      state.tasksById[id] = task;

      // link super and sub tasks
      const superTask = state.tasksById[superTaskId];

      if (prevTaskId) {
        // when inserted in the subTasks array where i > 0
        const prevTask = state.tasksById[prevTaskId];
        const { nextTaskId } = prevTask;
        prevTask.nextTaskId = task.id;
        task.prevTask = prevTask;
        if (nextTaskId) {
          const nextTask = state.tasksById[nextTaskId];
          task.nextTask = nextTaskId;
          nextTask.prevTask = task;
        }

        // insert into the array.
        const prevTaskIdIdx = superTask.subTaskIds.indexOf(prevTaskId);
        superTask.subTaskIds.splice(prevTaskIdIdx + 1, 0, task.id);
      } else {
        if (superTask.subTaskIds.length) {
          const currentFirstSubTask = superTask.subTaskIds[0];
          currentFirstSubTask.prevTaskId = task.id;
          task.nextTaskId = currentFirstSubTask.id;
        }

        superTask.subTaskIds.unshift(task.id);
      }
    },
    editTask({ state }, { id, description }) {
      if (description) {
        state.tasksById[id].description = description;
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
    makeSubTask({ state }, { id, superTaskId, prevTaskId }) {
      const task = state.tasksById[id];
      const superTask = state.tasksById[superTaskId];
      const idx = superTask.subTaskIds.indexOf(id);
      superTask.subTaskIds.splice(idx, 1);
      task.superTaskId = prevTaskId;

      const prevTask = state.tasksById[prevTaskId];
      prevTask.nextTaskId = task.nextTaskId;
      task.nextTaskId = prevTask.subTaskIds[0];

      const currentFirstSubTaskId = prevTask.subTaskIds[0];
      const currentFirstSubTask = state.tasksById[currentFirstSubTaskId];
      currentFirstSubTask.prevTaskId = id;
    }, // becomes a subtask of its previous task
    makeSuperTask() {}, // becomes a nextTask of the superTask,
    makeProject() {},
    getOwnBoard() {},
  },
});
