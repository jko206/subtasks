import { shallowMount } from '@vue/test-utils'
import ProgressIndicator from '../../src/components/progress-indicator.vue'

describe('progress-indicator.vue', () => {
  it('Checkmark is gray when progress is 0', () => {
    const wrapper = shallowMount(ProgressIndicator, {
      propsData: {
        value: 0,
      },
    })
    const checkmark = wrapper.find('.checkmark')
    expect(checkmark.classes().includes('gray-checkmark'))
  })

  it('Checkmark is orange when progress is 0', () => {
    const wrapper = shallowMount(ProgressIndicator, {
      propsData: {
        value: 0.5,
      },
    })
    const checkmark = wrapper.find('.checkmark')
    expect(checkmark.classes().includes('orange-checkmark'))
  })

  it('Checkmark is green when progress is 0', () => {
    const wrapper = shallowMount(ProgressIndicator, {
      propsData: {
        value: 1,
      },
    })
    const checkmark = wrapper.find('.checkmark')
    expect(checkmark.classes().includes('green-checkmark'))
  })
})
