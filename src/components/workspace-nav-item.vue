<template>
  <div
    :class="[
      'workspace-nav-item',
      'workspace-name',
      { current: isCurrent },
      { focused: isFocused },
    ]"
    @click="handleClick"
  >
    <input
      type="text"
      placeholder="Workspace name"
      class="workspace-name-input"
      @blur="
        cancelNameChange
        isFocused = false
      "
      v-model="workingWorkspaceName"
      :disabled="isDisabled"
      @keydown.enter="changeWorkspaceName(workingWorkspaceName)"
      @keydown.esc="cancelNameChange"
      ref="workspace-name-input"
    />
  </div>
</template>

<script>
export default {
  name: 'WorkspaceNavItem',
  data() {
    return {
      isDisabled: true,
      isClicked: false,
      workingWorkspaceName: null,
      timeoutEvent: null,
      isFocused: false,
    }
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  created() {
    this.workingWorkspaceName = this.workspaceName
  },
  watch: {
    workspaceName() {
      this.workingWorkspaceName = this.workspaceName
    },
    isFocused() {
      if (this.isFocused) this.$refs['workspace-name-input'].focus()
    },
  },
  computed: {
    isCurrent() {
      return this.id === this.$store.state.currentWorkspaceId
    },
    workspaceName() {
      return this.$store.state.tasksById[this.id].title
    },
  },
  methods: {
    changeWorkspaceName(name) {
      this.$refs['workspace-name-input'].blur()
      console.log(name)
      this.$store.commit('updateTask', {
        id: this.id,
        prop: 'title',
        value: name,
      })

      this.$store.commit('saveWorkspaces')
      this.$store.commit('saveTasks')
    },
    changeWorkspace() {
      this.$store.commit('setCurrentWorkspaceId', this.id)
    },
    cancelNameChange() {
      this.isDisabled = true
      this.workingWorkspaceName = this.workspaceName
    },
    handleClick() {
      if (this.isClicked) {
        this.isDisabled = false
        this.$nextTick(() => {
          this.isFocused = true
        })
      } else {
        this.isClicked = true
        this.changeWorkspace()
        this.timeoutEvent = setTimeout(() => {
          this.isClicked = false
        }, 300)
      }
    },
  },
}
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
