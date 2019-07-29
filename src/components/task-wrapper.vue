<template>
  <div class="task-wrapper">
    <div :class="['main-task', `depth-${depth}`]" ref="input-wrapper">
      <input
        :value="task.description"
        @change="updateItem"
        @keydown.enter.exact="addTask('below')"
        @keydown.meta.enter="addTask('above')"
        @keydown.tab.exact.prevent="indent($event)"
        @keydown.shift.tab.prevent="unindent($event)"
        :placeholder="id.substr(0, 10)"
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
import { setTimeout } from 'timers';

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
    this.$refs['input-wrapper'].querySelector('input').focus();
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
