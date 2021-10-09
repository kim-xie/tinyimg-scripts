import { describe, test, expect } from '@jest/globals'
const { IMG_REGEXP } = require('../src/lib/core/tinyImg')

describe('validate: IMG_REGEXP', () => {
  test('test IMG_REGEXP', () => {
    expect(IMG_REGEXP.test('.png')).toBe(true)
  })
})
