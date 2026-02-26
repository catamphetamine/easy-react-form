import { describe, it } from 'mocha'
import { expect } from 'chai'

import { getNext } from './utility.js'

describe('utility', () => {
	it('should get next value', () => {
		expect(getNext(1)).to.equal(2)
	})
})