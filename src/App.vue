<template>
  <div id="app">
    <TaskWrapper v-for="id in taskIds" :key="id" :id="id" :depth="0" />

    <TaskFilters />
  </div>
</template>

<script>
import TaskWrapper from './components/task-wrapper.vue';
import TaskFilters from './components/task-filters.vue';
import { mapState, mapActions } from 'vuex';

export default {
  name: 'app',
  components: {
    TaskWrapper,
    TaskFilters,
  },
  data() {
    return {
      inputValue: '',
    };
  },
  created() {
    this.$store.dispatch('initialize');
  },
  computed: {
    ...mapState('filters', ['showOnlyLeafSubTasks']),
    taskIds() {
      const { rootId, tasksById } = this.$store.state;
      if (this.showOnlyLeafSubTasks) {
        return Object.values(tasksById)
          .filter(task => !task.subTaskIds.length)
          .map(task => task.id);
      } else {
        return tasksById[rootId].subTaskIds;
      }
    },
  },
  methods: {
    ...mapActions(['addTask']),
    processInput() {
      const description = this.inputValue;
      if (description) {
        this.addTask({ description });
        this.inputValue = '';
      }
    },
  },
};
</script>

<style scoped lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

