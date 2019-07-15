<template>
  <div id="app">
    <TaskWrapper />
  </div>
</template>

<script>
import TaskWrapper from "./components/task-wrapper.vue";

export default {
  name: "app",
  components: {
    TaskWrapper
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
