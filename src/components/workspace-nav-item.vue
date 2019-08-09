<template>
  <div
    :class="['workspace-nav-item', 'workspace-name', { current: isCurrent }]"
    @click="changeWorkspace(id)"
  >
    <input
      type="text"
      :value="workspaceName"
      placeholder="Workspace name"
      class="workspace-name-input"
      @change="changeWorkspaceName"
    />
  </div>
</template>

<script>
export default {
  name: 'WorkspaceNavItem',
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  computed: {
    workspaceName() {
      return this.$store.state.tasksById[this.id].title;
    },
    isCurrent() {
      return this.$store.state.currentWorkspace === this.id;
    },
  },
  methods: {
    changeWorkspaceName($event) {
      this.$store.commit('updateTask', {
        id: this.id,
        prop: 'title',
        value: $event.target.value,
      });
    },
    changeWorkspace() {
      this.$store.commit('setCurrentWorkspaceId', this.id);
    },
  },
};
</script>


<style scoped lang="scss">
.workspace-name {
  padding: 1rem;
  position: relative;
  user-select: none;
  cursor: pointer;

  &::after {
    content: '';
    position: absolute;
    width: 85%;
    left: 7.5%;
    bottom: 10px;
    border-bottom: 3px solid #a2a2ff;
  }
  &:hover,
  &.current {
    &::after {
      border-color: rgb(76, 76, 252);
    }
  }
}

.workspace-name-input {
  background: transparent;
  border: 0;
  margin: 0;
  text-align: center;
}
</style>
