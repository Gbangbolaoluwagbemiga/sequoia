// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Payeer is Ownable {
    struct Session {
        string title;
        address creator;
        address[] participants;
        string[] taunts;
        uint256 entryFee;
        address tokenAddress; // address(0) for ETH
        bool isActive;
        bool isCancelled;
        address winner;
        uint256 totalPool;
    }

    mapping(uint256 => Session) public sessions;
    uint256 public nextSessionId;
    uint256 public platformFeePercentage = 1; // 1% fee

    event SessionCreated(uint256 indexed sessionId, string title, uint256 entryFee, address tokenAddress, address creator);
    event ParticipantJoined(uint256 indexed sessionId, address participant, string taunt);
    event WinnerSelected(uint256 indexed sessionId, address winner, uint256 prizeAmount, uint256 fee);
    event SessionCancelled(uint256 indexed sessionId);
    event FeeUpdated(uint256 newFee);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Creates a new betting session.
     * @param _title The title of the session.
     * @param _entryFee The amount of ETH/Token required to join.
     * @param _tokenAddress The token to use (address(0) for ETH).
     */
    function createSession(string memory _title, uint256 _entryFee, address _tokenAddress) public {
        Session storage newSession = sessions[nextSessionId];
        newSession.title = _title;
        newSession.creator = msg.sender;
        newSession.entryFee = _entryFee;
        newSession.tokenAddress = _tokenAddress;
        newSession.isActive = true;
        
        emit SessionCreated(nextSessionId, _title, _entryFee, _tokenAddress, msg.sender);
        nextSessionId++;
    }

    /**
     * @dev Joins an active session.
     * @param _sessionId The ID of the session to join.
     * @param _taunt A fun message to taunt other players.
     */
    function joinSession(uint256 _sessionId, string memory _taunt) public payable {
        Session storage session = sessions[_sessionId];
        require(session.isActive, "Session is not active");

        if (session.tokenAddress == address(0)) {
            require(msg.value == session.entryFee, "Incorrect ETH entry fee");
        } else {
            require(msg.value == 0, "Do not send ETH for token session");
            IERC20(session.tokenAddress).transferFrom(msg.sender, address(this), session.entryFee);
        }

        session.participants.push(msg.sender);
        session.taunts.push(_taunt);
        session.totalPool += session.entryFee;

        emit ParticipantJoined(_sessionId, msg.sender, _taunt);
    }

    /**
     * @dev Selects a random winner.
     * @param _sessionId The ID of the session.
     */
    function spinWheel(uint256 _sessionId) public {
        Session storage session = sessions[_sessionId];
        require(session.isActive, "Session is not active");
        require(session.participants.length > 0, "No participants");
        // Only creator or owner can spin? Let's say anyone for now, or maybe creator?
        // Let's stick to anyone to avoid locking funds if creator disappears.

        uint256 randomIndex = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    session.participants.length,
                    session.totalPool
                )
            )
        ) % session.participants.length;

        address winner = session.participants[randomIndex];
        session.winner = winner;
        session.isActive = false;

        uint256 fee = (session.totalPool * platformFeePercentage) / 100;
        uint256 prize = session.totalPool - fee;
        
        // Reset pool to prevent re-entrancy issues (though we update isActive first)
        session.totalPool = 0; 

        if (session.tokenAddress == address(0)) {
            // Transfer Fee to Owner (or keep in contract for withdraw)
            (bool feeSuccess, ) = owner().call{value: fee}("");
            require(feeSuccess, "Fee transfer failed");

            (bool success, ) = winner.call{value: prize}("");
            require(success, "Prize transfer failed");
        } else {
            IERC20(session.tokenAddress).transfer(owner(), fee);
            IERC20(session.tokenAddress).transfer(winner, prize);
        }

        emit WinnerSelected(_sessionId, winner, prize, fee);
    }

    /**
     * @dev Updates the platform fee.
     */
    function setPlatformFee(uint256 _fee) public onlyOwner {
        require(_fee <= 10, "Fee cannot exceed 10%");
        platformFeePercentage = _fee;
        emit FeeUpdated(_fee);
    }

    /**
     * @dev Returns participants of a specific session.
     */
    function getParticipants(uint256 _sessionId) public view returns (address[] memory) {
        return sessions[_sessionId].participants;
    }

    /**
     * @dev Returns taunts of a specific session.
     */
    function getTaunts(uint256 _sessionId) public view returns (string[] memory) {
        return sessions[_sessionId].taunts;
    }
    
    function getSession(uint256 _sessionId) public view returns (
        string memory title,
        uint256 entryFee,
        address tokenAddress,
        bool isActive,
        address winner,
        uint256 totalPool,
        uint256 participantCount
    ) {
        Session storage session = sessions[_sessionId];
        return (
            session.title,
            session.entryFee,
            session.tokenAddress,
            session.isActive,
            session.winner,
            session.totalPool,
            session.participants.length
        );
    }
}
