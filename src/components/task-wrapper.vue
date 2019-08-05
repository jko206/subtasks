<template>
  <div class="task-wrapper" v-if="isShown">
    <div :class="['main-task', `depth-${depth}`]" ref="input-wrapper">
      <ProgressIndicator :value="task.progress" @click.native="updateProgress" />
      <input
        :value="task.description"
        @change="updateItem"
        @keydown.enter.exact="addTask('below')"
        @keydown.meta.enter="addTask('above')"
        @keydown.tab.exact.prevent="indent($event)"
        @keydown.shift.tab.prevent="unindent($event)"
        placeholder="Write a task"
        @keydown.up.exact="focusPrevTask"
        @keydown.down.exact="focusNextTask"
        @keydown.delete.exact="deleteTask"
      />
    </div>
    <TaskWrapper
      v-for="childId in task.subTaskIds"
      :id="childId"
      :key="childId"
      :depth="depth + 1"
    />
  </div>
</template>

<script>
import ProgressIndicator from './progress-indicator.vue';
import { mapState } from 'vuex';

function getLastDescendant(taskId, tasksById) {
  // console.log(subTaskIds, superTaskId, tasksById);
  const { subTaskIds } = tasksById[taskId];
  return subTaskIds.length ? getLastDescendant(subTaskIds.last(), tasksById) : taskId;
}

function getClosestNextTask(taskId, tasksById) {
  if (tasksById[taskId].isRoot) return;
  const { nextTaskId, superTaskId } = tasksById[taskId];
  return nextTaskId || (superTaskId && getClosestNextTask(superTaskId, tasksById));
}

export default {
  name: 'TaskWrapper',
  components: { ProgressIndicator },
  props: {
    id: {
      type: String,
      required: true,
    },
    depth: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  computed: {
    ...mapState('filters', [
      'showOnlyLeafSubTasks',
      'showInProgressTasks',
      'showCompletedTasks',
      'showNotStartedTasks',
    ]),
    task() {
      return this.$store.state.tasksById[this.id];
    },
    progressEnum() {
      const { progress } = this.task;
      return progress === 0 ? 'not_started' : progress === 1 ? 'completed' : 'in_progress';
    },
    isFocused() {
      return this.$store.state.focusedTaskId === this.id;
    },
    isLeafSubTask() {
      return !this.task.subTaskIds.length;
    },
    isShown() {
      const progress = this.progressEnum;
      return (
        !this.isLeafSubTask ||
        ((this.showNotStartedTasks && progress === 'not_started') ||
          (this.showCompletedTasks && progress === 'completed') ||
          (this.showInProgressTasks && progress === 'in_progress'))
      );
    },
  },
  watch: {
    isFocused() {
      if (this.isFocused) this.focusInput();
    },
  },
  created() {
    const { progress, superTaskId } = this.task;
    // this.$store.dispatch('updateTaskProgress', superTaskId);
  },
  mounted() {
    this.focusInput();
  },
  methods: {
    addTask(position) {
      this.$store.dispatch('addTask', {
        [position === 'below' ? 'prevTaskId' : 'nextTaskId']: this.id,
      });
    },
    updateItem(event) {
      const { id } = this;
      console.log(event.target.value);
      this.$store.dispatch('editTask', {
        id,
        description: event.target.value,
      });
    },
    updateProgress() {
      const { id } = this;
      const { progress, superTaskId } = this.task;
      const newProgress = progress < 1 ? 1 : 0;
      if (this.task.subTaskIds.length) {
        this.$store.dispatch('markSubTasksAsDone', {
          id,
          progress: newProgress,
        });
      } else {
        const { progress } = this.task;
        this.task.progress = progress === 1 ? 0 : progress === 0 ? 0.5 : 1;
      }
      this.$store.dispatch('updateSuperTaskProgress', superTaskId);
      this.$store.commit('saveTasks');
    },
    indent($event) {
      const { id, prevTaskId } = this.task;
      if (prevTaskId) {
        this.$store.dispatch('makeSubTask', {
          id,
          superTaskId: prevTaskId,
        });
      }
    },
    unindent($event) {
      const { id, superTaskId } = this.task;
      if (superTaskId !== this.$store.state.rootId) {
        this.$store.dispatch('makeNextTask', {
          id,
          prevTaskId: superTaskId,
        });
      }
    },
    focusPrevTask() {
      const { superTaskId, prevTaskId } = this.task;
      const { tasksById } = this.$store.state;

      const toFocusId = (prevTaskId && getLastDescendant(prevTaskId, tasksById)) || superTaskId;
      this.$store.commit('focusTask', toFocusId);
    },
    focusNextTask() {
      const { tasksById } = this.$store.state;
      const toFocusId = this.task.subTaskIds[0] || getClosestNextTask(this.id, tasksById);
      this.$store.commit('focusTask', toFocusId);
    },
    focusInput() {
      this.$refs['input-wrapper'].querySelector('input').focus();
    },
    deleteTask() {
      if (this.task.description) return;
      let confirmDelete = true;
      if (this.task.subTaskIds.length) {
        confirmDelete = confirm('SubTasks will be deleted.');
      }
      if (confirmDelete) {
        this.$store.dispatch('removeTask', this.id);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
$paddingIncrement: 10px;

@for $i from 1 through 10 {
  .depth-#{$i} {
    padding-left: $paddingIncrement * $i;
  }
}

.task-wrapper {
  line-height: 1.5;
}

.main-task {
  display: flex;
  height: 35px;
  margin: 5px;
  align-items: center;
}

.main-task input {
  margin: 0;
  margin-left: 5px;
  width: 200px;
  border: 0;
  font-size: 1.125rem;
  outline: none;
}

input:focus {
  border-bottom: 1px solid gray;
}
</style>
