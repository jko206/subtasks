import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
// import WorkspaceNavItem from '@/components/workspace-nav-item.vue';
import WorkspaceNav from '@/components/workspace-nav.vue'

const localVue = createLocalVue()

localVue.use(Vuex)

const ws0 = {
  id: 'workspace_0',
  title: 'workspace_0',
}
const ws1 = {
  id: 'workspace_1',
  title: 'workspace_1',
}
const ws2 = {
  id: 'workspace_2',
  title: 'workspace_2',
}
const ws3 = {
  id: 'workspace_3',
  title: 'workspace_3',
}

describe('progress-indicator.vue', () => {
  let store, wrapper
  let addWorkspace = jest.fn(() => {
    store.state.tasksById[ws3.id] = ws3
    store.state.workspaceIds.push(ws3.id)
    store.state.currentWorkspaceId = ws3.id
  })
  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        tasksById: {
          workspace_0: ws0,
          workspace_1: ws1,
          workspace_2: ws2,
        },
        workspaceIds: [ws0.id, ws1.id, ws2.id],
        currentWorkspaceId: ws0.id,
      },
      actions: {
        addWorkspace,
      },
    })
    // wrapper = shallowMount(WorkspaceNav, {
    //   localVue,
    //   store,
    // });
  })
  it('passes test', () => {})
  // it('Renders workspace buttons', () => {
  //   const navItems = wrapper.find(WorkspaceNavItem);
  //   expect(navItems.length).toBe(3);
  // });
  // it('creates new workspace', () => {});
})
