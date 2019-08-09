<template>
  <div class="workspace-nav">
    <WorkspaceNavItem v-for="id in workspaceIds" :key="id" :id="id" />
    <div class="workspace-name empty" @click="addWorkspace">
      + Workspace
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import WorkspaceNavItem from './workspace-nav-item.vue';
export default {
  name: 'WorkspaceNav',
  components: { WorkspaceNavItem },
  computed: {
    ...mapState(['tasksById', 'workspaceIds']),
  },
  methods: {
    ...mapActions(['addWorkspace']),
  },
};
</script>

<style scoped lang="scss">
.workspace-nav {
  height: 50px;
  background: gainsboro;
  box-shadow: 0px 3px 6px #bdbdbd;
  display: flex;
  align-items: center;
  justify-content: center;
}

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
</style>
