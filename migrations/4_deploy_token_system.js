const Token = artifacts.require('DtxToken.sol')
const TokenRegistry = artifacts.require('DtxTokenRegistry.sol')
const GateKeeper = artifacts.require('GateKeeper')
const { createPermission } = require('./helpers/permissions')

async function deployTokenSystem(deployer, network, accounts) {
  const dGateKeeper = await GateKeeper.deployed()

  try {
    // Deploy token registry
    await deployer.deploy(TokenRegistry, dGateKeeper.address)
    const dTokenRegistry = await TokenRegistry.deployed()
    try {
      await createPermission(
        dGateKeeper,
        accounts[0],
        dTokenRegistry,
        'LIST_TOKEN_ROLE',
        accounts[0]
      )
    } catch (error) {
      console.log('Error granting permissions on the Registry', error)
      throw new Error(error.message)
    }
    // Deploy token
    await deployer.deploy(
      Token,
      'DTX',
      18,
      dTokenRegistry.address,
      dGateKeeper.address
    )
    await dTokenRegistry.addToken('DTX', Token.address)
  } catch (e) {
    console.log(e)
  }
}

module.exports = (deployer, network, accounts) => {
  deployer
    .then(function() {
      return deployTokenSystem(deployer, network, accounts)
    })
    .catch(error => {
      console.log(error)
      process.exit(1)
    })
}
