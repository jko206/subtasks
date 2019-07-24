<template>
  <div class="task-wrapper">
    <div :class="['main-task', `depth-${depth}`]">
      <input
        ref="input"
        :value="task.description"
        @input="updateItem"
        @keydown.enter.exact="addTask"
        @keydown.tab.exact.prevent="indent"
        @keydown.shift.tab.prevent="unindent"
        :placeholder="id.substr(0, 10)"
      />
    </div>
    <TaskWrapper
      v-for="childId in task.subTasksIds"
      :id="childId"
      :key="childId"
      :depth="depth + 1"
    />
  </div>
</template>

<script>
import TextEditor from './text-editor.vue';

export default {
  name: 'TaskWrapper',
  components: { TextEditor },
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
  },
  mounted() {
    if (this.task.isNew) {
      this.$refs.input.focus();
    }
    delete this.task.isNew;
  },
  methods: {
    addTask() {
      this.$store.dispatch('addTask', {
        superTaskId: this.task.superTaskId,
        prevTaskId: this.id,
      });
    },
    updateItem(event) {
      const { id } = this;
      this.$store.dispatch('editTask', {
        id,
        description: event.target.value,
      });
    },
    indent() {
      const { id, superTaskId, prevTaskId } = this.task;
      this.$store.dispatch('makeSubTask', {
        id,
        superTaskId, // so as to remove from array
        prevTaskId, // become this tasks's subtask
      });
    },
    unindent() {
      console.log('unindent');
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
</style>
