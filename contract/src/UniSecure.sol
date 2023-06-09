// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

contract UniSecure is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    struct Entity {
        string name;
        string industry;
        string[] endpoints;
        string publicKey;
    }

    // DataRequest represents an individual request for data
    struct DataRequest {
        address dataSender;
        address user;
        string data;
    }

    // Storage for data requests, mapped by recipient
    mapping(address => DataRequest[]) public requestsByRecipient;

    mapping (address => Entity) public entities;
    bytes32 private jobId;
    uint256 private fee;

    /**
     * @notice Initialize the link token and target oracle
     *
     * Sepolia Testnet details:
     * Link Token: 0x779877A7B0D9E8603169DdbD7836e478b4624789
     * Oracle: 0x6090149792dAAeE9D1D568c9f9a6F6B46AA29eFD (Chainlink DevRel)
     * jobId: 7d80a6386ef543a3abb52817f6707e3b
     *
     */
    constructor() ConfirmedOwner(msg.sender) {
        setChainlinkToken(0x779877A7B0D9E8603169DdbD7836e478b4624789);
        setChainlinkOracle(0x6090149792dAAeE9D1D568c9f9a6F6B46AA29eFD);
        jobId = "7d80a6386ef543a3abb52817f6707e3b";
        fee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)
    }

    /**
     * @dev Register/update an entity
     * @param _name Name of the entity
     * @param _industry Industry of the entity
     * @param _endpoints Endpoints of the entity
     * @param _publicKey Public key of the entity
     */
    function registerEntity(
        string calldata _name, 
        string calldata _industry, 
        string[] calldata _endpoints, 
        string calldata _publicKey
        ) external {
        entities[msg.sender] = Entity(_name, _industry, _endpoints, _publicKey);
    }

    /**
     * @dev Get an entity
     * @param _entityAddress Address of the entity
     */
    function getEntity(address _entityAddress) external view returns (Entity memory) {
        return entities[_entityAddress];
    }

    function addressToString(address _addr) internal pure returns(string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";

        bytes memory str = new bytes(42);
        str[0] = "0";
        str[1] = "x";
        for(uint i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint(uint8(value[i + 12] >> 4))];
            str[3+i*2] = alphabet[uint(uint8(value[i + 12] & 0x0f))];
        }
        return string(str);
    }

    function requestData(
        address sender, 
        uint256 endpointId,
        string memory userPubKey,
        string memory receiverPubKey
        ) public returns (bytes32 requestId) {
        // Create a Chainlink.Request object
        Chainlink.Request memory request = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfill.selector
        );
        
        string memory endpoint = (entities[sender].endpoints)[endpointId];
        // Set the request parameters
        request.add("get", endpoint);

        request.add("path", "data");
        request.add("user", addressToString(msg.sender));
        request.add("userPubKey", userPubKey);
        request.add("receiverPubKey", receiverPubKey);
        request.add("endpointUrl", endpoint);
        
        return sendChainlinkRequest(request, fee);
    }


    // function requestData(string memory userpubKey, address sender, 
    // uint256 endpointId, address receiver) public returns (string memory) {
    //     string memory price = executeRequest();
    //     return price;
    // }

    /**
     * @notice Receives the response in the form of string
     *
     * @param _requestId - id of the request
     * @param _data - response data
     * @param _dataSender - address of the sender entity
     * @param _dataReceiver - address of the receiver entity
     */
    function fulfill(bytes32 _requestId, string memory _data, address _dataSender, address _dataReceiver)
        public
        recordChainlinkFulfillment(_requestId)
    {
        requestsByRecipient[_dataReceiver].push(DataRequest(_dataSender, msg.sender, _data));

    }

    /**
     * Allow withdraw of Link tokens from the contract
     */
    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(
            link.transfer(msg.sender, link.balanceOf(address(this))),
            "Unable to transfer"
        );
    }
}
