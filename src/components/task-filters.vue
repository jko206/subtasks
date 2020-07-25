<template>
  <div class="filters">
    <input
      type="checkbox"
      name="leaf-sub-tasks-only"
      id="leaf-sub-tasks-only"
      :checked="showOnlyLeafSubTasks"
      @click="toggleOnlyLeafSubTasks"
    />
    <label for="leaf-sub-tasks-only">
      Only leaf tasks
    </label>
    <input
      type="checkbox"
      name="in-progress-tasks"
      id="in-progress-tasks"
      :checked="showInProgressTasks"
      @click="toggleInProgressTasks"
    />
    <label for="in-progress-tasks">
      In progress
    </label>
    <input
      type="checkbox"
      name="completed-tasks"
      id="completed-tasks"
      :checked="showCompletedTasks"
      @click="toggleCompletedTasks"
    />
    <label for="completed-tasks">
      Completed
    </label>
    <input
      type="checkbox"
      name="not-started-tasks"
      id="not-started-tasks"
      :checked="showNotStartedTasks"
      @click="toggleNotStartedTasks"
    />
    <label for="not-started-tasks">
      Not started
    </label>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

export default {
  name: 'TaskFilters',
  computed: {
    ...mapState('filters', [
      'showOnlyLeafSubTasks',
      'showInProgressTasks',
      'showCompletedTasks',
      'showNotStartedTasks',
    ]),
  },
  methods: {
    ...mapMutations('filters', [
      'toggleOnlyLeafSubTasks',
      'toggleInProgressTasks',
      'toggleCompletedTasks',
      'toggleNotStartedTasks',
    ]),
  },
}
</script>

<style lang="scss" scoped>
.filters {
  position: absolute;
  top: 80px;
  right: 20px;
  width: 200px;
  display: grid;
  grid-template-columns: 30px auto;
  grid-template-rows: repeat(4, 30px);
  align-items: center;

  label {
    user-select: none;
  }
}
</style>
