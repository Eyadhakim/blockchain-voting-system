require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');

const app = express();
app.use(express.json());
app.use(express.static('client'));

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const abi = [
    "function vote(bytes32 fingerprint) public",
    "function hasVoted(bytes32) public view returns (bool)",
    "function voteCount() public view returns (uint256)"
];

const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

app.post('/vote', async (req, res) => {
    try {
        const { fingerprint } = req.body;
        const fingerprintHash = ethers.keccak256(ethers.toUtf8Bytes(fingerprint));
        
        const alreadyVoted = await contract.hasVoted(fingerprintHash);
        if (alreadyVoted) {
            return res.status(400).json({ error: 'Already voted.' });
        }

        const tx = await contract.vote(fingerprintHash);
        await tx.wait();
        
        res.json({ success: true, tx: tx.hash });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/index.html');
});

app.get('/votecount', async (req, res) => {
    try {
        const count = await contract.voteCount();
        res.json({ count: count.toString() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));