<template>
  <div id="app">
    <TaskWrapper v-for="id in taskIds" :key="id" :id="id" :depth="0" />
  </div>
</template>

<script>
import TaskWrapper from './components/task-wrapper.vue';
import { mapState, mapActions } from 'vuex';

export default {
  name: 'app',
  components: {
    TaskWrapper,
  },
  data() {
    return {
      inputValue: '',
    };
  },
  created() {
    const root = this.$store.state.root;
    const rootId = root.id;
    this.$store.dispatch('addTask', {
      superTaskId: rootId,
      isNew: true,
    });
  },
  computed: {
    taskIds() {
      return this.$store.state.root.subTaskIds;
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

window.init = function() {
  vm.$store.dispatch('addTask', {
    isRootTask: true,
    description: 'this is the first task',
  });

  vm.$store.dispatch('addTask', {
    isRootTask: true,
    description: 'this is the second task',
  });

  const firstTaskId = vm.$store.state.rootTasks[0].id;

  vm.$store.dispatch('addTask', {
    isRootTask: true,
    description: 'this is the first task',
    superTaskId: firstTaskId,
  });
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

