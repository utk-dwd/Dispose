// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/EntropyWallet.sol";

/**
 * @title Deploy EntropyWallet
 * @dev Deployment script for EntropyWallet contract on Base mainnet
 */
contract DeployEntropyWallet is Script {
    
    // Base mainnet Pyth Entropy contract address
    // You can find current addresses at: https://docs.pyth.network/entropy/contract-addresses
    address constant PYTH_ENTROPY_BASE_MAINNET = 0x6E7D74FA7d5c90FEF9F0512987605a6d546181Bb;
    
    function run() external {
        // Start broadcasting transactions
        vm.startBroadcast();
        
        // Deploy the EntropyWallet contract
        EntropyWallet entropyWallet = new EntropyWallet(PYTH_ENTROPY_BASE_MAINNET);
        
        console.log("EntropyWallet deployed to:", address(entropyWallet));
        console.log("Pyth Entropy address:", PYTH_ENTROPY_BASE_MAINNET);
        console.log("Current entropy fee:", entropyWallet.getEntropyFee());
        
        vm.stopBroadcast();
    }
}