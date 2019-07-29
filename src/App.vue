<template>
  <div id="app">
    <TaskWrapper v-for="id in taskIds" :key="id" :id="id" :depth="0" />
  </div>
</template>

<script>
import TaskWrapper from './components/task-wrapper.vue';
import { mapState, mapActions } from 'vuex';

function calculateProgress(deadline, user, role, customers) {
  // for deadline, user, and role, determine [ completed, total ] time for a set of customers
  return (
    customers
      // first, turn the list of customers into a list of relevant sections
      .reduce(
        (sections, customer) =>
          isCustomerDueByDeadline(deadline, customer) &&
          isCustomerRelevantToRole(user, role, customer)
            ? sections.concat(
                customer.checklistSections.filter(s => sectionRelevantToRole(role, s))
              )
            : sections,
        []
      )
      // then sum the times of those sections
      .reduce(
        ([completed, total], section) => [
          completed + (section.status === CLOSE_STATUSES.COMPLETE ? section.minutes : 0),
          total + section.minutes,
        ],
        [0, 0]
      )
  );
}

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
    const rootTaskId = this.$store.state.root.id;
    this.addTask({
      superTaskId: rootTaskId,
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

