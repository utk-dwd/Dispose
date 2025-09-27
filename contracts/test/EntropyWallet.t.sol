// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/EntropyWallet.sol";

/**
 * @title EntropyWallet Test
 * @dev Test suite for EntropyWallet contract
 */
contract EntropyWalletTest is Test {
    
    EntropyWallet public entropyWallet;
    address public mockEntropyContract;
    address public user;
    
    function setUp() public {
        // Create mock entropy contract address
        mockEntropyContract = makeAddr("mockEntropy");
        user = makeAddr("user");
        
        // Deploy EntropyWallet with mock entropy address
        entropyWallet = new EntropyWallet(mockEntropyContract);
        
        // Give user some ETH for testing
        vm.deal(user, 10 ether);
    }
    
    function testContractDeployment() public {
        assertEq(address(entropyWallet.entropy()), mockEntropyContract);
    }
    
    function testGenerateWalletAddress() public {
        bytes32 randomBytes = keccak256(abi.encodePacked("test random bytes"));
        address walletAddress = entropyWallet.generateWalletAddress(randomBytes);
        
        // Should generate a valid address
        assertTrue(walletAddress != address(0));
        
        // Same input should generate same address (deterministic)
        address walletAddress2 = entropyWallet.generateWalletAddress(randomBytes);
        assertEq(walletAddress, walletAddress2);
        
        // Different input should generate different address
        bytes32 randomBytes2 = keccak256(abi.encodePacked("different random bytes"));
        address walletAddress3 = entropyWallet.generateWalletAddress(randomBytes2);
        assertTrue(walletAddress != walletAddress3);
    }
    
    function testReceiveEther() public {
        // Contract should be able to receive ETH
        vm.prank(user);
        (bool success,) = address(entropyWallet).call{value: 1 ether}("");
        assertTrue(success);
        assertEq(address(entropyWallet).balance, 1 ether);
    }
}