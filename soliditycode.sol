// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SaveMerch {
    struct Object {
        string username;
        uint256 age;
    }

    mapping(address => Object) private objects;

    function saveObject(string memory username, uint256 age) public {
        objects[msg.sender] = Object(username, age);
    }

    function getObject() public view returns (string memory, uint256) {
        Object memory obj = objects[msg.sender];
        return (obj.username, obj.age);
    }
}

// this contract defines a Object struct with username and age fields The saveObject method allows saving of an object 
// the getObject retrieves the object