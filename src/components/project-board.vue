<template>
  <div class="project-board">
    <TaskWrapper v-for="subTaskId in subTaskIds" :key="subTaskId" :id="subTaskId" :depth="0" />
  </div>
</template>

<script>
import TaskWrapper from './task-wrapper.vue';

export default {
  name: 'ProjectBoard',
  components: { TaskWrapper },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  computed: {
    subTaskIds() {
      return this.$store.state.tasksById[this.id].subTaskIds;
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
