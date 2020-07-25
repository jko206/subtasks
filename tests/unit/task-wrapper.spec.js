import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import TaskWrapper from '@/components/workspace-nav-item.vue'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('workspace-nav-item.vue', () => {
  let navItem, store, updateTask, setCurrentWorkspaceId

  beforeEach(() => {
    updateTask = jest.fn()
    setCurrentWorkspaceId = jest.fn(() => {
      store.state.currentWorkspaceId = 'id_1'
    })
    store = new Vuex.Store({
      state: {
        currentWorkspaceId: 'id_0',
        tasksById: {
          id_0: {
            title: 'id_0 workspace',
          },
          id_1: {
            title: 'id_1 workspace',
          },
        },
      },
      mutations: {
        updateTask,
        setCurrentWorkspaceId,
      },
    })

    navItem = shallowMount(WorkspaceNavItem, {
      localVue,
      propsData: {
        id: 'id_1',
        workspaceName: 'workspace 1',
      },
      store,
    })
  })

  it('highlight is off when isCurrent is false', () => {
    expect(navItem.classes()).not.toContain('current')
  })

  it('highlight is on when isCurrent is true', () => {
    store.state.currentWorkspaceId = 'id_1'
    expect(navItem.classes()).toContain('current')
  })

  it('becomes current when clicked', () => {
    navItem.trigger('click')
    expect(navItem.classes()).toContain('current')
  })

  it('allows workspace name on double click', () => {
    navItem.trigger('click')

    expect(navItem.vm._data.isClicked).toBe(true)

    navItem.trigger('click')

    navItem.vm.$nextTick(() => {
      expect(navItem.classes()).toContain('focused')
    })
  })

  it('changes workspace name', () => {
    const changeWorkspaceName = jest.fn()
    navItem.setMethods({
      changeWorkspaceName,
    })
    navItem.setData({ isDisabled: false })
    const newWorkspaceName = 'new name'
    const inputElem = navItem.find('input')
    inputElem.trigger('focus')
    inputElem.setValue(newWorkspaceName)
    inputElem.trigger('keydown.enter')
    expect(changeWorkspaceName).toHaveBeenCalled()
    expect(inputElem.element.value).toBe(newWorkspaceName)
  })
})
