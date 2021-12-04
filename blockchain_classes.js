const SHA256 = require('crypto-js/sha256');
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

class Transaction{
    constructor(sender, receiver, amount, time=Date.now(), signature=null) {
        this.sender = sender;
        this.receiver = receiver;
        this.amount = amount;
        this.time = time;
        this.signature = signature
        this.hash = 0;
    }
    get_hash() {
        return SHA256(this.sender + this.receiver + this.amount + this.time).toString();
    }
    sign_tx(key) {
        var key_obj = ec.keyFromPrivate(key);
        if (key_obj.getPublic('hex') !== this.sender) {
            console.log("Key/Wallet incorrect.")
        }
        else {
            this.hash = this.get_hash();
            const signature = key_obj.sign(this.hash, "base64");
            this.signature = signature.toDER("hex");
        }
    }
    validator() {
        if (this.sender === "Mining Reward") {
            return true;
        }
        else if (!this.signature) {
            console.log();
            console.log("No Transaction Signature: ");
            console.log(this);
            console.log();
        }
        else if (this.signature.length === 0) {
            console.log();
            console.log("Empty Signature string: ");
            console.log(this);
            console.log();
        }
        else {
            const public_key = ec.keyFromPublic(this.sender, "hex");
            return public_key.verify(this.get_hash(), this.signature);
        }
    }
}

class Block{
    constructor(data, time, difficulty, previous_hash='') {
        this.data = data;
        this.time = time;
        this.difficulty = difficulty;
        this.previous_hash = previous_hash;
        this.nonce = 0;
        this.hash = '';
    }

    // get_hash() returns the hash of a block
    get_hash() {
        return SHA256(this.data + JSON.stringify(this.data) + this.time + this.nonce + this.previous_hash).toString();
    }

    mine() {
        this.hash = this.get_hash();
        while (this.hash.substring(0, this.difficulty) != "0".repeat(this.difficulty)) {
            this.nonce += 1;
            this.hash = this.get_hash();
        }
    }
}

class Blockchain{
    constructor() {
        // The blockchain itself is an array in the Blockchain class
        this.chain = [];
        this.difficulty = 4;
        this.pending_tx = [];
        this.mining_reward = 100;
    }

    // genesis function generates the first block in the chain
    genesis(publicKey) {
        const first_tx = new Transaction("Mining Reward", publicKey, 100)
        const block = new Block({transactions: [first_tx]}, "", 4, "0".repeat(64));
        block.mine();
        this.chain.push(block);
    }

    new_tx(sender, receiver, amount, key_obj) {
        const tx = new Transaction(sender, receiver, amount);
        tx.sign_tx(key_obj);
        if (tx.validator()) {
            this.pending_tx.push(tx);
        }
        else {
            console.log("Invalid Transaction rejected: ");
            console.log(tx);
        }
    }

    add_tx(tx) {
        if (tx.validator()) {
            this.pending_tx.push(tx);
        }
        else {
            console.log("Invalid Transaction rejected: ");
            console.log(tx);
        }
    }

    validate_signatures(transactions) {
        var valid_txs = [];
        transactions.forEach((tx, index) => {
            if (tx.validator() === true) {
                valid_txs.push(tx);
            }
        });
        return valid_txs;
    }

    validate_transaction_amounts(transactions) {
        var valid_txs = [];
        var valid_sign_txs = this.validate_signatures(transactions);
        valid_sign_txs.forEach((tx, index) => {
            if (tx.validator() === true) {
                // Checks a list of transactions and returns the sum for a given address
                function get_sum(tx, txs) {
                    var sum = 0;
                    var other_txs = txs.slice(0, index).concat(txs.slice(index+1, txs.length));
                    var sender_txs = [];
                    other_txs.forEach(tx2 => {
                        if (tx2.sender === tx.sender) {
                            sender_txs.push(tx2.amount);
                        }
                    });
                    var receiver_txs = [];
                    other_txs.forEach(tx3 => {
                        if (tx3.receiver === tx.sender) {
                            receiver_txs.push(tx3.amount);
                        }
                    });
                    sender_txs.map(n => sum-=n);
                    receiver_txs.map(n => sum+=n);
                    return sum;
                }
                function get_prev_sum(tx, txs) {
                    var sum = 0;
                    var sender_txs = [];
                    txs.forEach(tx2 => {
                        if (tx2.sender === tx.sender) {
                            sender_txs.push(tx2.amount);
                        }
                    });
                    var receiver_txs = [];
                    txs.forEach(tx3 => {
                        if (tx3.receiver === tx.sender) {
                            receiver_txs.push(tx3.amount);
                        }
                    });
                    sender_txs.map(n => sum-=n);
                    receiver_txs.map(n => sum+=n);
                    return sum;
                }
                // sequentially checks 
                function check_previous_sums(blockchain, tx, block_n) {
                    if (block_n < 0) {
                        return false;
                    }
                    var prev_trans = blockchain.chain[block_n].data.transactions;
                    if (tx.amount < get_prev_sum(tx, prev_trans)) {
                        return true;
                    }
                    else {
                        return check_previous_sums(blockchain, tx, block_n-1);
                    }
                }

                // If the sum exceeds the transaction amount, add the transaction to the list of valid ones.
                if (tx.amount < get_sum(tx, valid_sign_txs)) {
                    valid_txs.push(tx);
                }
                // If enough transactions to put the sender in the black are not found in the currently being mined block, begin checking previous blocks.
                else if (check_previous_sums(this, tx, this.chain.length-1)) {
                    valid_txs.push(tx);
                }
            }
        });
        return valid_txs;
    }

    // new_block adds a new block to the chain
    mine_block(mining_address) {
        // Transactions Validation
        if (this.pending_tx.length !== 0) {

            // console.log("Begin Mining New Block");
            // console.log()
            // console.log(this.pending_tx);

            var valid_txs = this.validate_transaction_amounts(this.pending_tx);

            // console.log()
            // console.log("Transactions verified.")
            // console.log()
            // console.log(valid_txs)

            // Add reward transaction
            // This is also where minimum number or maximum number of txs per block can be defined.
            // Just remember to -1 for the Mining Reward.
            if (valid_txs.length !== 0) {
                // Add mining reward
                valid_txs.push(new Transaction("Mining Reward", mining_address, this.mining_reward));

                console.log()
                console.log("Mining Reward created.")

                // Clear txs from pending queue
                valid_txs.forEach(tx => {
                    this.pending_tx = this.pending_tx.filter(ptx => {
                        if (ptx !== tx) {
                            return ptx;
                        }
                    })
                });

                console.log()
                console.log("Pending Queue cleared.")

                // Block Creation

                console.log()
                console.log("Beginning Block creation.")

                const data = {transactions: valid_txs};
                const block = new Block(data, Date.now(), this.difficulty);
                block.previous_hash = this.chain[this.chain.length - 1].hash;
                block.mine();
                // this.chain.push(block);
                console.log("New Block Mined: " + block.hash);
                console.log();
                return block;
            }
            else{
                // console.log("Insufficient Verified Transactions.")
                // clear sufficiently old transactions from queue
                return "No TX"
            }
        }
    }

    // get a block by it's hash
    get_block(hash_to_find) {
        var block = this.chain.filter(blk => {return blk.hash === hash_to_find});
        // Assuming two blocks will never have the same hash, we use the first in the list:
        return block[0];
    }

    // get the height of a block by it's hash
    get_height(hash_to_find) {
        var block = this.chain.filter(blk => {return blk.hash === hash_to_find});
        return this.chain.indexOf(block[0]);
    }

    // Ensure the validity of the current chain
    validate_chain() {
        this.chain.forEach((blk, height) => {
            if (blk.hash !== blk.get_hash()) {
                return false;
            }
            if (height !== 0) {
                var last_blk = this.chain[height - 1];
                if (blk.previous_hash !== last_blk.hash) {
                    return false;
                }
            }
        });

        return true;
    }

    get_balance(address) {
        var balance = 0;
        this.chain.forEach(blk => {
            blk.data.transactions.forEach(tx => {
                if (tx.sender === address) {
                    balance -= tx.amount;
                }
                else if (tx.receiver === address) {
                    balance += tx.amount;
                }
            });
        });
        return balance;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;