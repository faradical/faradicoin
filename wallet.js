// ~~~~~~~~~~~~~~~~~~~~ IMPORT DEPENDENCIES ~~~~~~~~~~~~~~~~~~~~ //

// Import Keygen functions
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

// Import Blockchain
const Blockchain = require("./blockchain_classes").Blockchain;

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
    // throw("Please provide a node or list of nodes to connect to.");
    var node = prompt("Please provide a node to connect to: ");
    var web_out = new WebOut(node);
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

// web_out.get_heartbeats(verbose=true).then(n => {
//     // OPTIONS
//     console.log("Please select an option:");
//     console.log("s - Send Faradicoin");
//     console.log("b - Check balance");
//     var response = prompt("Select option: ");
//     // Check balance
//     // Send money
//     // while (response != "q") {
//         if (response === "s") {
//             //
//             var remote_address = prompt("Please enter the recipient's wallet address: ");
//             var amount = prompt("Please enter the transaction amount: ");
//             var tx = new Transaction(my_wallet_address, remote_address, amount);
//             tx.sign_tx(my_keys);
//             web_out.transaction(tx).then(res => {
//                 //
//                 console.log(res)
//             });
//         }
//         else if (response === "b") {
//             //
//             console.log();
//             web_out.get_blockchain().then(res => {
//                 console.log("I am a fuck head");
//                 var blockchain = new Blockchain();
//                 blockchain.chain = res;
//                 var balance = blockchain.get_balance(my_wallet_address);
//                 console.log(`node says balance is:`);
//                 console.log(balance);
//                 console.log();
//             }).catch(() => {
//                 console.log("Unable to retrieve balance.");
//             });
//         }
//         else {
//             //
//             console.log(`${response} not an option.`)
//         }
//         // console.log();
//         // console.log("Please select an option:")
//         // console.log("s - Send Faradicoin")
//         // console.log("b - Check balance")
//         // var response = prompt("Select option: ")
//     // }
// });






// ~~~~~~~~~~~~~~~~~~~~ TESTING ~~~~~~~~~~~~~~~~~~~~ //


// node miner.js --port=3000 --publicKey=0424ac99cd638202aaf78c1a9faea024216e2f366a0fceee276a5de81923dc2666813b852d0d8ed65380aec7459145c839e42a69258ca975a247b317316db2aee


const Alice_keypair = ec.genKeyPair();
const Alice_key = ec.keyFromPrivate(Alice_keypair.getPrivate('hex'));
const Alice_wallet_address = Alice_key.getPublic('hex');
const Vandale_keypair = ec.genKeyPair();
const Vandale_key = ec.keyFromPrivate(Vandale_keypair.getPrivate('hex'));
const Vandale_wallet_address = Vandale_key.getPublic('hex');
const Bob_keypair = ec.genKeyPair();
const Bob_key = ec.keyFromPrivate(Bob_keypair.getPrivate('hex'));
const Bob_wallet_address = Bob_key.getPublic('hex');

var tx = new Transaction(my_wallet_address, Alice_wallet_address, 30);
tx.sign_tx(key);
web_out.transaction(tx);

var tx1 = new Transaction(Alice_wallet_address, Bob_wallet_address, 20)
tx1.sign_tx(Alice_key)
web_out.transaction(tx1);

var tx2 = new Transaction(Bob_wallet_address, Vandale_wallet_address, 10);
tx2.sign_tx(Bob_key);
web_out.transaction(tx2);