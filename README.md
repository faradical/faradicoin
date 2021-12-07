<h1 align="center">Faradicoin</h1>
<!---
<p align="center" style="font-size:small;">Faradical<br>auto_sear#8264<br>www.github.com/faradical</p>
--->

## Abstract
Faradicoin is a project developed to explore and demonstrate the underlying technology of crypotocurrencies. It is constructed on a Proof-of-Work based Blockchain similiar to what is used Bitcoin and other cryptocurrencies. The project is currently written in JavaScript using the MERN stack with the elliptic module handling encryption keys and crypto-js/sha256 to perform cryptographic hashing. It demonstrates all the basics of a modern cryptocurrency including the technical aspects and core principles required in creating a viable currency using a decentralized, trustless network.

<!---
## Objective
--->

All hashes are in hexidecimal format.

## Transaction Verification
Transactions in Faradicoin are constructed at the wallet level and submitted to miners in JSON format. Each transaction features five default properties: 
* **Sender address:** Or the Wallet address, the public key of the sender.
* **Reciever address:** The public key of the reciever.
* **Transaction amount:** The amount of Faradicoin to be sent.
* **Time stamp:** Time when the transaction is created by the wallet.
* **Previous Hash:** The hash of the last transaction created by the sender wallet, with the initial-use hash being 0.

A new SHA256 hash for the transaction is then created using the Sender, Reciever, Amount, and Previous Hash properties. At this point, the **key pair object* is used to sign the hash. This ensures no two messages will have the same hash/signature pair, eliminating the possibility of transaction forgery. 

![Faradicoin_Transaction_Signing](Documentation/Faradicoin_Transaction_Signing.png)

Transactions are then POSTed to the `/transaction` route of all miners in the wallet's network, allowing them to compete with each other to process the transaction quicker than the other nodes and thus increase their likelihood of claiming the reward. As transactions are received by the miners, they immediately begin validating signatures. First the signature property is checked to ensure it is not empty, then the Sender address is used to generate a public key object with elliptic.js and the hash (a freshly generated hash of the transaction, not the hash property) is checked against the signature using the `.verify()` method. If the transaction is valid, it is then added to the pending transaction queue.

When sufficient transactions have been sumbitted to begin mining a block,

## Proof-of-Work


## Block Verification
<!---
A key element in all distributed blockchains is decentralized censensus. Network rules
--->

## Incentive vs. Trust
Why follow the rules?
<!---
Ways to hack the current system include:
* Creating and submitting thousands of small transactions to a single mining node in order to receive a reward. Solution would involve overhaul of the network to to become fully decentralized, with all meesages being simultaneously multicast to every node on the network. Gun.js may be be a useful way to achieve this. Nodes would then reject any blocks containing transactions that were not in their pending queues (excepting mining rewards).
--->

## Further Developments
* Decentralized Network with Mulitcast addressing
* Real-time verification of transaction amounts (To improve block mining time)
* Merkle Trees for disk space preservation via the discarding of spent transactions with breaking block hashes.
* Minimum/maximum block sizes.
* Dynamic updates to difficulty and mining reward size.
* Mining "fees" or tips that can be added to transactions for the miner to claim.
* Alternative proof systems
* Smart Contracts
* Storing data directly on the blockchain.
* Adaptive difficulty and block rewards.

## Conclusion


## Donate

