<template>
  <div class="task-wrapper">
    <div :class="['main-task', `depth-${depth}`]" ref="input-wrapper">
      <ProgressIndicator :value="task.progress" @input="updateProgress" />
      <input
        :value="task.description"
        @change="updateItem"
        @keydown.enter.exact="addTask('below')"
        @keydown.meta.enter="addTask('above')"
        @keydown.tab.exact.prevent="indent($event)"
        @keydown.shift.tab.prevent="unindent($event)"
        placeholder="Empty task"
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
import TextEditor from './text-editor.vue';
import ProgressIndicator from './progress-indicator.vue';

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
  components: { TextEditor, ProgressIndicator },
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
    task() {
      return this.$store.state.tasksById[this.id];
    },
    isFocused() {
      return this.$store.state.focusedTaskId === this.id;
    },
  },
  watch: {
    isFocused() {
      if (this.isFocused) this.focusInput();
    },
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
    updateProgress(progress) {
      const { id } = this;
      this.$store.dispatch('editTask', {
        id,
        progress,
      });
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
