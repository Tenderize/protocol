const Controller = artifacts.require("Controller")
const BondingManager = artifacts.require("BondingManager")
const AdjustableRoundsManager = artifacts.require("AdjustableRoundsManager")

const {contractId} = require("../utils/helpers")

module.exports = function (callback) {
    (async function() {
        try {
            const accounts = await web3.eth.getAccounts()
            const controller = await Controller.deployed()

            const bondingManagerAddr = await controller.getContract(contractId("BondingManager"))
            const bondingManager = await BondingManager.at(bondingManagerAddr)

            const roundsManagerAddr = await controller.getContract(contractId("RoundsManager"))
            const roundsManager = await AdjustableRoundsManager.at(roundsManagerAddr)

            let currentRound = await roundsManager.currentRound()
            console.log("Start round:", currentRound.toString())
            console.log("Start Stake:", (await bondingManager.pendingStake(accounts[0], currentRound)).toString())
            
            const roundLength = await roundsManager.roundLength.call()

            // Get the round length 
            for (let i = 0; i < 10; i ++) {
                await roundsManager.mineBlocks(roundLength.toString())
                const initialized = await roundsManager.currentRoundInitialized()
                if (!initialized) {
                    await roundsManager.initializeRound()
                }
                await bondingManager.reward()
            }

            currentRound = await roundsManager.currentRound()
            console.log("End round:", currentRound.toString())
            console.log("End Stake:", (await bondingManager.pendingStake(accounts[0], currentRound)).toString())
            callback(null)
        } catch (err) {
            callback(err)
        }
    }())
}

