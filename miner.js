// ~~~~~~~~~~~~~~~~~~~~ IMPORT DEPENDENCIES ~~~~~~~~~~~~~~~~~~~~ //
// Import Blockchain
const Blockchain = require("./blockchain_classes").Blockchain;

// Import Transaction class
const Transaction = require("./blockchain_classes").Transaction;

// Import Keygen functions
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

// Import prompt-sync
const prompt = require('prompt-sync')();

// Import minimist for command line arguments
const args = require('minimist')(process.argv.slice(2));

// Import Server dependencies
const WebOut = require("./web_classes").WebOut;
const express = require('express');
const app = express();

// Import .env
require('dotenv').config()

// Import Mongoose and set up database connection
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URI, { useNewUrlParser: true });
const db = mongoose.connection;

// Import multithreading dependencies
//

// ~~~~~~~~~~~~~~~~~~~~ COMMAND LINE INPUT ~~~~~~~~~~~~~~~~~~~~ //
// Get keys from command line.
if ('keyFile' in args) {
    const keys_file = args['keyFile'];
    // attempt keys extractions
    var key = ""
    throw("The --keyFile option is currently unsupported. Please use --publicKey=YOUR_KEY to input your public key.");
} else if ('publicKey' in args) {
    var key = args['publicKey'];
    // Check key
} else {
    var key = prompt("Please input your public key to continue miner setup: ");
    // Check key
}

// Get starting nodes from command line.
if ('nodesFile' in args) {
    const nodes_file = args['nodesFile'];
    var genesis = false;
    throw("The --nodesFile option is currently unsupported. Please use --node=NODE_URL to input a starting node.");
} else if ('node' in args) {
    var node = args['node'];
    var node_list = [node];
    var web_out = new WebOut(node_list);
    var genesis = false;
} else {
    console.log("No starting nodes provided. Starting as the first node in the network.");
    var genesis = true;
    var node_list = [];
    var web_out = new WebOut(node_list);
}

// Get custom server port from command line
if ('port' in args) {
    var port = args['port'];
} else {
    var port = 3000;
    console.log("No port specified, defaulting to 3000.");
}

// ~~~~~~~~~~~~~~~~~~~~ SET UP DATABASE ~~~~~~~~~~~~~~~~~~~~ //
db.on('error',(error) => console.error(error));
db.once('open', () => console.log(`Connected to database: ${db.name}.`));

// ~~~~~~~~~~~~~~~~~~~~ CREATE BLOCKCHAIN ~~~~~~~~~~~~~~~~~~~~ //
let blockchain = new Blockchain();
if (genesis == true) {
    // Generate new blockchain from scratch
    console.log("Creating new blockchain.")
    blockchain.genesis(key);
} else {
    // GET request current blockchain from starting node
    blockchain.chain = web_out.get_blockchain();
}

// ~~~~~~~~~~~~~~~~~~~~ CONNECT TO NETWORK ~~~~~~~~~~~~~~~~~~~~ //
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
async function mine(){
    while (true) {
        if (blockchain.pending_tx.length > 0) {
            // console.log("mining...")
            // Mine a block
            let block = blockchain.mine_block(key);
            if (block !== "No TX"){
                console.log(block);
                console.log(block.data.transactions);
                // Check for any new blocks added
                if (block.previous_hash == blockchain.chain[blockchain.chain.length-1].hash) {
                    // Broadcast block to other nodes
                    web_out.broadcast_block(block);
                    // Add block to blockchain
                    blockchain.chain.push(block);
                    console.log()
                    console.log("New block broadcasted and added.")
                    console.log()
                }
            }
        }
        await sleep(5);
    }
}

// ~~~~~~~~~~~~~~~~~~~~ START SERVER ~~~~~~~~~~~~~~~~~~~~ //
app.use(express.json());

app.get("/", (req, res) => {
    console.log("Main route accessed:");
    try {
        res.status(200).send("data");
        console.log("Successfully!");
    } catch (err) {
        res.status(500).json({message: err.message});
        console.log("Unsuccessfully! :(");
    }
    console.log();
});

// Heartbeat route
app.get("/heartbeat", (req, res) => {
    try {
        data = { type: 'miner' };
        res.status(200).send(data);
        console.log("Heartbeat requested.")
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});

app.get("/pending_queue", (req, res) => {
    try {
        data = blockchain.pending_tx;
        res.status(200).send(data);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});

// Receive new transaction route
app.post("/transaction", (req, res) => {
    try {
        console.log("New Transaction Received.");
        var tx = new Transaction(req.body.sender, req.body.receiver, req.body.amount, req.body.time, req.body.signature);
        blockchain.add_tx(tx)
        res.status(200).send("Transaction Received");
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});

// Receive new block route
app.post("/block", (req, res) => {
    try {
        res.status(200).send("");
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});

// Recieve request for current copy of blockchain
app.get("/blockchain", (req, res) => {
    try {
        var data = blockchain.chain;
        res.status(200).send(data);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});

// Recieve request for current node list
app.get("/nodes", (req, res) => {
    try {
        res.status(200).send("");
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});

app.listen(port, () => {
    // Console logging
    console.log(`Server started on port ${port}.`);
    console.log("To access this server in development, use:");
    console.log(`http://localhost:${port}/`);
    
    // mining
    mine().then(() =>{
        console.log();
    }).catch(err => {
        console.log(err);
    });
});
