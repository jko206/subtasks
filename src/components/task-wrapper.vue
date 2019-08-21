<template>
  <div :class="('task-wrapper', { leaf: isAtomic, root: isRoot })" v-if="isShown">
    <div :class="['main-task', `depth-${depth}`]" ref="input-wrapper">
      <FoldToggle
        v-if="!isAtomic && !task.isProject"
        :show="showSubTasks"
        class="fold-toggle"
        @click.native="showSubTasks = !showSubTasks"
      />
      <ProgressIndicator :value="task.progress" @click.native="updateProgress" />
      <input
        v-model="workingTitle"
        @keydown.enter.exact="updateItem()"
        @keydown.enter.meta.shift="
          addTask('above');
          updateItem();
        "
        @keydown.meta.enter.exact="
          addTask('below');
          updateItem();
        "
        @keydown.tab.exact.prevent="
          indent($event);
          updateItem();
        "
        @keydown.shift.tab.prevent="
          unindent($event);
          updateItem();
        "
        placeholder="Write a task"
        @keydown.esc.exact="workingTitle = title"
        @keydown.up.exact="
          focusPrevTask;
          updateItem();
        "
        @keydown.down.exact="
          focusNextTask;
          updateItem();
        "
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
      workingTitle: '',
    };
  },
  created() {
    this.workingTitle = this.title;
  },
  watch: {
    title() {
      this.workingTitle = this.title;
    },
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
    title() {
      return this.task.title;
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
    isRoot() {
      const { superTaskId } = this.task;
      return this.$store.state.workspaceIds.includes(superTaskId);
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
    updateItem() {
      const { id } = this;
      this.$store.dispatch('editTask', {
        id,
        title: this.workingTitle,
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
      const { superTaskId, id } = this.task;
      if (!this.isRoot) {
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
      const { workspaceIds } = this.$store.state;
      const { superTaskId, isRoot, task } = this;
      if (this.workingTitle || (isRoot && !task.prevTaskId && !task.nextTaskId)) return;
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

// .root {
//   float: left;
//   padding: 10px;
//   border-radius: 10px;
//   background: #f1f1f1;
//   margin: 10px;
// }
</style>
