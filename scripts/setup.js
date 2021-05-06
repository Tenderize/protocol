const Controller = artifacts.require("Controller")
const BondingManager = artifacts.require("BondingManager")
const AdjustableRoundsManager = artifacts.require("AdjustableRoundsManager")
const LivepeerToken = artifacts.require("LivepeerToken")
const {contractId} = require("../utils/helpers")

module.exports = function (callback) {
    (async function() {
        try {
            const accounts = await web3.eth.getAccounts()
            const INITIAL_BOND = web3.utils.toWei("1000")
            const PERC_MULTIPLIER = 10000
            const rewardCut = (5 * PERC_MULTIPLIER).toString()
            const feeShare = (90 * PERC_MULTIPLIER).toString()
            const controller = await Controller.deployed()

            // unpause 
            const paused = await controller.paused()
            if (paused) {
                await controller.unpause()
            }

            const bondingManagerAddr = await controller.getContract(contractId("BondingManager"))
            const bondingManager = await BondingManager.at(bondingManagerAddr)

            const roundsManagerAddr = await controller.getContract(contractId("RoundsManager"))
            const roundsManager = await AdjustableRoundsManager.at(roundsManagerAddr)

            const tokenAddr = await controller.getContract(contractId("LivepeerToken"))
            const token = await LivepeerToken.at(tokenAddr)

            // initialise round
            const initialized = await roundsManager.currentRoundInitialized()
            if (!initialized) {
                await roundsManager.initializeRound()
            }
            
            // bond a transcoder
            await token.approve(bondingManagerAddr, INITIAL_BOND)
            await bondingManager.bond(INITIAL_BOND, accounts[0])
            await bondingManager.transcoder(rewardCut, feeShare)

            // Get the round length 
            const roundLength = await roundsManager.roundLength.call()
            await roundsManager.mineBlocks(roundLength.toString())
            await roundsManager.initializeRound()
            callback(null)
        } catch (err) {
            callback(err)
        }
    }())
}

