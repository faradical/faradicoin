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
    console.log(web_out);
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
            console.log("mining...")
            // Mine a block
            let block = blockchain.mine_block(key);
            console.log(block);
            console.log(block.data.transactions);
            // Check for any new blocks added
            if (block.previous_hash !== blockchain.chain.previous_hash) {
                // Broadcast block to other nodes
                web_out.broadcast_block(block);
                // Add block to blockchain
                blockchain.chain.push(block);
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
        data = JSON.stringify({ type: 'miner' })
        res.status(200).send(data);
        console.log("Heartbeat requested.")
        console.log();
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});

// Receive new transaction route
app.post("/transaction", (req, res) => {
    try {
        console.log("New Transaction Received.");
        var tx = new Transaction(req.body.sender, req.body.receiver, req.body.amount, req.body.time, req.body.signature);
        blockchain.pending_tx.push(tx)
        res.status(200).send("Transaction Recieved");
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
        var data = JSON.stringify(blockchain.chain)
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
    mine()
});












// // ~~~~~~~~~~~~~~~~~~~~ TESTING BULLSHIT ~~~~~~~~~~~~~~~~~~~~ //

// //demo people's keys
// const my_keypair = ec.genKeyPair();
// console.log("My Private Key: 0a74e53795eeafad0ea38842e24f04a3fa4c4963cfaf662ad7733c763cce8912");
// const my_key = ec.keyFromPrivate("0a74e53795eeafad0ea38842e24f04a3fa4c4963cfaf662ad7733c763cce8912");
// const my_wallet_address = my_key.getPublic('hex');
// console.log("My Wallet Address: " + my_wallet_address);

// const Alice_keypair = ec.genKeyPair();
// const Alice_key = ec.keyFromPrivate(Alice_keypair.getPrivate('hex'));
// const Alice_wallet_address = Alice_key.getPublic('hex');

// const Vandale_keypair = ec.genKeyPair();
// const Vandale_key = ec.keyFromPrivate(Vandale_keypair.getPrivate('hex'));
// const Vandale_wallet_address = Vandale_key.getPublic('hex');

// const Bob_keypair = ec.genKeyPair();
// const Bob_key = ec.keyFromPrivate(Bob_keypair.getPrivate('hex'));
// const Bob_wallet_address = Bob_key.getPublic('hex');

// // Testing
// // console.log();
// // console.log("Creating New Testing Chain");
// console.log();

// function sleep(ms) {
//     return new Promise((resolve) => {
//         setTimeout(resolve, ms);
//     });
// }
// async function stall(){
//     while(true){
//         console.log(cum)
//         await sleep(5000);
//     }
// }
// stall()

// blockchain.new_tx(my_wallet_address, Alice_wallet_address, 20, my_key);
// // blockchain.mine_block(my_wallet_address);

// stall()

// blockchain.new_tx(Alice_wallet_address, Bob_wallet_address, 10, Alice_key);
// blockchain.new_tx(my_wallet_address, Alice_wallet_address, 20, my_key);
// blockchain.new_tx(Alice_wallet_address, Bob_wallet_address, 100, Alice_key);
// // blockchain.mine_block(my_wallet_address);

// stall()

// blockchain.new_tx(my_wallet_address, Vandale_wallet_address, 20, my_key);
// blockchain.new_tx(Alice_wallet_address, Bob_wallet_address, 10, Alice_key);
// // blockchain.mine_block(my_wallet_address);



// console.log("My balance: " + blockchain.get_balance(my_wallet_address));
// console.log("Van's balance: " + blockchain.get_balance(Vandale_wallet_address));
// console.log("Alice's balance: " + blockchain.get_balance(Alice_wallet_address));
// console.log("Bob's balance: " + blockchain.get_balance(Bob_wallet_address));
// console.log(blockchain.validate_chain());

// console.log(JSON.stringify(blockchain.chain, null, 4));
// //0424ac99cd638202aaf78c1a9faea024216e2f366a0fceee276a5de81923d6c2666813b852d0d8ed65380aec7459145c839e42a69258ca975a247b317316db2aee
