const express = require('express');
const { Web3 } = require('web3');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3000;

// Static file serving (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Set up web3 connection
const web3 = new Web3("http://127.0.0.1:7545"); // Use your Infura or other provider URL

// Contract configuration
const contractAddress = '0xb776603a763747124f7d79249bAA1f96e0BCAC1E'; // Update with your contract address
const contractABI = require('./abi.json'); // Assuming ABI is stored in a separate JSON file

const contract = new web3.eth.Contract(contractABI, contractAddress);

// Route to interact with contract (e.g., fetch all models)
app.get('/api/models', async (req, res) => {
    try {
        const modelCount = await contract.methods.modelCount().call();
        let models = [];

        for (let i = 1; i <= modelCount; i++) {
            const model = await contract.methods.models(i).call();
            models.push(model);
        }

        res.json(models);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to load models' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
