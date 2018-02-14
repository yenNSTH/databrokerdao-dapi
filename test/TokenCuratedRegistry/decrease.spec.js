/* eslint-env mocha */
/* global assert contract artifacts */

const testEvent = require('@settlemint/solidity-mint/test/helpers/testEvent')

const SensorRegistry = artifacts.require('SensorRegistry.sol')
const Token = artifacts.require('DtxToken.sol')

contract('SensorRegistry', accounts => {
  describe('Function: decrease', async () => {
    const [seller] = accounts

    it('should decrease the stake for the listing as when stake is still the minimum stake', async () => {
      const registry = await SensorRegistry.deployed()
      const token = await Token.deployed()

      // Enlist before we can unlist
      await token.approve(seller, '10', {
        from: seller,
      })
      await registry.enlist('1', '20', '10')

      await token.approve(seller, '10', {
        from: seller,
      })
      const tx = await registry.decrease('1', '10')

      // Check if event was emitted
      testEvent(tx, 'Decreased', {
        listing:
          '0x1000000000000000000000000000000000000000000000000000000000000000',
        decreasedBy: '10',
        newDeposit: '10',
      })
    })

    it('should not decrease when stake amount would go beneath minimum stake', async () => {
      const registry = await SensorRegistry.deployed()
      const token = await Token.deployed()

      // Enlist before we can unlist
      await token.approve(seller, '10', {
        from: seller,
      })
      await registry.enlist('1', '10', '10')

      try {
        assert.throws(await registry.decrease('1', '5'), 'invalid opcode')
      } catch (e) {
        console.log(e)
      }
    })
  })
})
