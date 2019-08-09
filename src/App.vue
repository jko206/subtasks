<template>
  <div id="app">
    <WorkspaceNav />
    <TaskWrapper v-for="id in taskIds" :key="id" :id="id" :depth="0" />

    <TaskFilters />
  </div>
</template>

<script>
import WorkspaceNav from './components/workspace-nav.vue';
import TaskWrapper from './components/task-wrapper.vue';
import TaskFilters from './components/task-filters.vue';
import { mapState, mapActions } from 'vuex';

export default {
  name: 'app',
  components: {
    WorkspaceNav,
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
      const { currentWorkspaceId, tasksById } = this.$store.state;
      if (this.showOnlyLeafSubTasks) {
        return Object.values(tasksById)
          .filter(task => !task.subTaskIds.length)
          .map(task => task.id);
      } else if (currentWorkspaceId) {
        return tasksById[currentWorkspaceId].subTaskIds;
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
<style>
body {
  margin: 0;
}
</style>
<style scoped lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>

