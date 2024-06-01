require("dotenv").config({ path: ".env" });
const express = require('express');
const {Web3} = require('web3');
const provider = "http://localhost:8545";
const web3 = new Web3(new Web3.providers.HttpProvider(provider));

// Create account and get credentials
const account = web3.eth.accounts.create();
const privateKey = process.env.HARDHAT_PRIVATE_KEY;
const fromAddress = process.env.HARDHAT_ACCOUNT_ADDRESS;


console.log(`New account created. Address: ${fromAddress}, Private Key: ${privateKey}`);

// Query the current block number
web3.eth.getBlockNumber().then(console.log);
//get eth balance for transactions
web3.eth.getBalance(process.env.HARDHAT_ACCOUNT_ADDRESS).then(console.log);
// get transaction count on account
web3.eth.getTransactionCount(process.env.HARDHAT_ACCOUNT_ADDRESS).then(console.log);

// Load contract ABI and address
const contractAbi = require('./savemerch.json'); // Ensure this file contains your contract ABI , should be similar to the abi file on the deployed contract 
const contractAddress = process.env.HARDHAT_CONTRACT_ADDRESS; // contract adress on localhost hardhat  // Replace with your contract address on Sepolia
const contract = new web3.eth.Contract(contractAbi, contractAddress);

const app = express();

// Middleware to parse JSON payloads
app.use(express.json());

//firebase set up 
const admin = require("firebase-admin");

const serviceAccount = require("./serviceaccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FBDB
});


app.post('/saveObject', async (req, res) => {
    const { username, userAddress } = req.body;

    if (!userAddress) {
        return res.status(400).send('userAddress is required');
    }

    try {
        // Estimate gas required for the transaction
        const gas = await contract.methods.addUser(username, userAddress).estimateGas({ from: fromAddress });
        const balance = await web3.eth.getBalance(fromAddress);
        console.log(`Account balance: ${web3.utils.fromWei(balance, 'ether')} ETH`);
        console.log(`Gas ${gas}`)
        // Create the transaction
        const tx = {
            from: fromAddress,
            to: contractAddress,
            gas: gas,
            gasPrice: await web3.eth.getGasPrice(),
            data: contract.methods.addUser(username, userAddress).encodeABI()
        };

        // Sign the transaction
        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);

        // Send the signed transaction
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        
        // Check if the transaction was successfully mined
        if (receipt.status) {
            console.log('Transaction successful:', receipt.transactionHash);
            //save to firebase // optional
            const db = admin.database();
            const ref = db.ref('blockchainlocations')
            await ref.push().set({
                username: username,
                userAddress: userAddress,
                transactionHash: receipt.transactionHash,
                blockHash: receipt.blockHash,
                logaddress:receipt.logs[0].address,
                to: receipt.to 
            })
            res.send('Object saved successfully');

        } else {
            console.error('Transaction failed:', receipt.transactionHash);
            res.status(500).send('Transaction failed');
        }
    } catch (error) {
        console.error('Error saving object:', error);
        res.status(500).send('Error saving object');
    }
});



const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
