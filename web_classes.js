const axios = require('axios');

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function GET(path) {
    return new Promise(function (resolve, reject) {
        axios.get(path).then((response) => {
            var result = response.data;
            resolve(result);
        }).catch((error) => {
            reject(error);
        });
    });
}

function POST(path, data) {
    return new Promise(function (resolve, reject) {
        axios.post(path, data).then((response) => {
            var result = response.data;
            resolve(result);
        }).catch((error) => {
            reject(error);
        });
    });
}

class WebOut{
    constructor(node_list) {
        this.node_list = node_list;
    }

    async transaction(transaction) {
        for (var i = 0; i < this.node_list.length; i++){
            var node = this.node_list[i];
            let url = node + "/transaction";
            var res = await POST(url, transaction)
            console.log(`${node} says: ${res}`)
        };
    }

    async get_blockchain(node=this.node_list[0]) {
        let url = node + "/blockchain";
        return await GET(url);
    }

    broadcast_block(block) {
        if (this.node_list.length !== 0) {
            for (var i = 0; i < this.node_list.length; i++){
                var node = this.node_list[i];
                let url = node + "/block";
                axios.post(url, block).then(res => {
                    if (res.status == 200) {
                        console.log(`${node} says: ${res.json()}`);
                    }
                    else {
                        console.error(`${node}: ${res.status}`);
                    }
                }).catch(err => {
                    console.error(`Encountered the following error sending block to ${node}:`);
                    console.error(err);
                });
            };
        }
        else {
            console.log("No nodes to broadcast to.")
        }
    }

    get_nodelist(node=this.node_list[0]) {
        let url = node + "/nodes";
        let out = [];
        axios.get(url).then(res => {
            out = res.json();
        }).catch(err => {
            console.error(`Encountered the following error requesting node list from ${node}:`);
            console.error(err);
        });
        return out;
    }

    async get_heartbeat(node=this.node_list[0]) {
        let url = node + "/heartbeat";
        var result = await GET(url);
        console.log(result.type);
        if(result.type == "miner"){
            return result;
        }
    }

    async get_heartbeats(verbose=false) {
        var n = 0;
        for (var i = 0; i < this.node_list.length; i++){
            var node = this.node_list[i]
            let url = node + "/heartbeat";
            var res = await GET(url);
            if(res.type == "miner") {
                n+=1;
            }
        };
        if (verbose == true) {
            console.log(`Connected to ${n} mining nodes.`)
        }
    }
}

module.exports.WebOut = WebOut;