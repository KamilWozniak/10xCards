import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import TestComponent from '../TestComponent.vue'
import { shallowMount } from '@vue/test-utils'

describe('TestComponent', () => {
  it('renderuje komponent poprawnie', async () => {
    const component = await shallowMount(TestComponent)
    console.log('test')
    expect(component.text()).toContain('Hello World')
  })

  it('zawiera przycisk', async () => {
    const component = await mountSuspended(TestComponent)

    const button = component.find('button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('Click me')
  })

  it('ma klasę test-component', async () => {
    const component = await mountSuspended(TestComponent)

    expect(component.find('.test-component').exists()).toBe(true)
  })
})
