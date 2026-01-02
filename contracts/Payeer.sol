// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Payeer {
    // Array to store the names of participants
    string[] public participants;

    // Event emitted when a new participant is added
    event ParticipantAdded(string name);
    
    // Event emitted when a payer is selected
    event PayerSelected(string name);
    
    // Event emitted when the list is reset
    event Reset();

    /**
     * @dev Adds a new participant to the list.
     * @param _name The name of the participant to add.
     */
    function addParticipant(string memory _name) public {
        require(bytes(_name).length > 0, "Name cannot be empty");
        participants.push(_name);
        emit ParticipantAdded(_name);
    }

    /**
     * @dev Selects a random participant to pay the bill.
     * @return The name of the selected participant.
     */
    function pickPayer() public returns (string memory) {
        require(participants.length > 0, "No participants to pick from");

        // Generate a pseudo-random index
        // Note: block.timestamp and block.prevrandao are not secure for high-stakes value,
        // but sufficient for a simple bill-splitting app.
        uint256 randomIndex = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    participants.length
                )
            )
        ) % participants.length;

        string memory selectedPayer = participants[randomIndex];
        emit PayerSelected(selectedPayer);
        
        return selectedPayer;
    }

    /**
     * @dev Returns the list of all participants.
     */
    function getParticipants() public view returns (string[] memory) {
        return participants;
    }

    /**
     * @dev Resets the list of participants.
     */
    function reset() public {
        delete participants;
        emit Reset();
    }
}
