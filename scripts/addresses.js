const Controller = artifacts.require("Controller")
const {contractId} = require("../utils/helpers")

module.exports = function (callback) {
    (async function() {
        try {
            const controller = await Controller.deployed()
            const bondingManagerAddr = await controller.getContract(contractId("BondingManager"))
            const roundsManagerAddr = await controller.getContract(contractId("RoundsManager"))
            const tokenAddr = await controller.getContract(contractId("LivepeerToken"))
            const faucetAddr = await controller.getContract(contractId("LivepeerTokenFaucet"))
    
            console.log("BondingManager:", bondingManagerAddr)
            console.log("RoundsManager:", roundsManagerAddr)
            console.log("LivepeerToken:", tokenAddr)
            console.log("LivepeerTokenFaucet:", faucetAddr)
            callback(null)
        } catch (err) {
            callback(err)
        }
    }())
}

