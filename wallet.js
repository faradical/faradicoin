// ~~~~~~~~~~~~~~~~~~~~ IMPORT DEPENDENCIES ~~~~~~~~~~~~~~~~~~~~ //

// Import Keygen functions
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

// Import Transaction class
const Transaction = require("./blockchain_classes").Transaction;

// Import prompt-sync
const prompt = require('prompt-sync')();

// Import minimist for command line arguments
const args = require('minimist')(process.argv.slice(2));

// Import network dependencies
const WebOut = require("./web_classes").WebOut;

// Import .env
require('dotenv').config()

// ~~~~~~~~~~~~~~~~~~~~ COMMAND LINE INPUT ~~~~~~~~~~~~~~~~~~~~ //

// KEYS
// Generate new key
// Accept key from command line
// Accept key from .env
// Accept key from file
if ('keyFile' in args) {
    const keys_file = args['keyFile'];
    // attempt keys extractions
    var key = ""
    throw("The --keyFile option is currently unsupported. Please use --privateKey=YOUR_KEY to input your private key.");

} else if ('privateKey' in args) {
    var key = args['privateKey'];
    // Check key

} else {
    var key = prompt("Please input your private key to continue miner setup: ");
    // Check key
}

// NODES
// Accept nodes from command line
// Accept nodes from .env
// Accept nodes from file
if ('nodesFile' in args) {
    const nodes_file = args['nodesFile'];
    throw("The --nodesFile option is currently unsupported. Please use --node=NODE_URL to input a starting node.");

} else if ('node' in args) {
    var node = args['node'];
    var node_list = [node];
    var web_out = new WebOut(node_list);

} else {
    throw("Please provide a node or list of nodes to connect to.");
}

console.log();
const my_keys = ec.keyFromPrivate(key);
const my_wallet_address = my_keys.getPublic('hex');
console.log("My Wallet Address: " + my_wallet_address);
console.log();
// OPTIONS
// Check balance
// Send money

// ~~~~~~~~~~~~~~~~~~~~ CONNECT TO NETWORK ~~~~~~~~~~~~~~~~~~~~ //
//console.log(web_out.node_list[0])
//console.log(web_out.get_heartbeat())

web_out.get_heartbeats(verbose=true);

// ~~~~~~~~~~~~~~~~~~~~ MAIN PROGRAM LOOP ~~~~~~~~~~~~~~~~~~~~ //

// OPTIONS
// Check balance
// Send money
const Alice_keypair = ec.genKeyPair();
const Alice_key = ec.keyFromPrivate(Alice_keypair.getPrivate('hex'));
const Alice_wallet_address = Alice_key.getPublic('hex');
var tx = new Transaction(my_wallet_address, Alice_wallet_address, 10);
tx.sign_tx(my_keys);
web_out.transaction(tx);
web_out.get_blockchain().then(res => {
    console.log(res)
})