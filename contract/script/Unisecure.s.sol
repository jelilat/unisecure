// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/UniSecure.sol";
import "./HelperConfig.sol";
import "../src/test/mocks/MockOracle.sol";
import "../src/test/mocks/LinkToken.sol";

contract DeployUniSecure is Script, HelperConfig {
    function run() external {
        HelperConfig helperConfig = new HelperConfig();

        (
            address oracle,
            ,
            ,
            address link,
            ,
            ,
            ,
            ,

        ) = helperConfig.activeNetworkConfig();

        if (link == address(0)) {
            link = address(new LinkToken());
        }

        if (oracle == address(0)) {
            oracle = address(new MockOracle(link));
        }

        vm.startBroadcast();

        new UniSecure();

        vm.stopBroadcast();
    }
}