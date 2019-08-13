<template>
  <div :class="('task-wrapper', { leaf: isAtomic })" v-if="isShown">
    <div :class="['main-task', `depth-${depth}`]" ref="input-wrapper">
      <FoldToggle
        v-if="!isAtomic && !task.isProject"
        :show="showSubTasks"
        class="fold-toggle"
        @click.native="showSubTasks = !showSubTasks"
      />
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
    <div class="sub-tasks" v-if="showSubTasks && !task.isProject">
      <TaskWrapper
        v-for="childId in task.subTaskIds"
        :id="childId"
        :key="childId"
        :depth="depth + 1"
      />
    </div>
  </div>
</template>

<script>
import ProgressIndicator from './progress-indicator.vue';
import FoldToggle from './fold-toggle.vue';
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
  components: { ProgressIndicator, FoldToggle },
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
  data() {
    return {
      showSubTasks: true,
    };
  },
  computed: {
    ...mapState('filters', [
      'showOnlyLeafSubTasks',
      'showInProgressTasks',
      'showCompletedTasks',
      'showNotStartedTasks',
    ]),
    ...mapState(['tasksById', 'focusedTaskId']),
    task() {
      return this.tasksById[this.id];
    },
    progressEnum() {
      const { progress } = this.task;
      return ['not_started', 'completed'][progress] || 'in-progress';
    },
    isFocused() {
      return this.focusedTaskId === this.id;
    },
    isAtomic() {
      return !this.task.subTaskIds.length;
    },
    isShown() {
      const progress = this.progressEnum;
      return (
        !this.isAtomic ||
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
    indent() {
      const { id, prevTaskId } = this.task;
      if (prevTaskId) {
        this.$store.dispatch('makeSubTask', {
          id,
          superTaskId: prevTaskId,
        });
      }
    },
    unindent() {
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
$indentation: 20px;

@for $i from 1 through 10 {
  .depth-#{$i} {
    padding-left: $indentation * $i;
    .leaf & {
      padding-left: $indentation * ($i + 1);
    }
  }
}

.task-wrapper {
  line-height: 1.5;
  align-items: center;
}

.main-task {
  display: flex;
  height: 35px;
  margin: 5px;
  align-items: center;
}

.fold-toggle {
  margin-right: 10px;
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
