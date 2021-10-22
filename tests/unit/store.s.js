// import store from '../../src/store'
const store = require('../../src/store/index')

describe('store', () => {
  describe('actions', () => {
    test('addWorkspace()', () => {
      store.dispatch('addWorksace')

      // const { workspaceIds, tasksById } = store
      expect(workspaceIds).toHaveLength(1)
      expect(Object.keys(tasksById)).toHaveLength(2)
    })
  })
})
