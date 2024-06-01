// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AddressStorage {
    struct User {
        string username;
        string useraddress;
    }

    User[] public users;
    uint256 public usersCount;

    event UserAdded(string username, string useraddress);

    function addUser(string memory _username, string memory _useraddress) public {
        users.push(User(_username, _useraddress));
        usersCount++;
        emit UserAdded(_username, _useraddress);
    }

    function getAllUsers() public view returns (User[] memory) {
        return users;
    }

    function getUsersCount() public view returns (uint256) {
        return usersCount;
    }
}
