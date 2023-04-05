const express = require('express');
const router = express.Router();
const axios = require("axios")

const etherscan = require('etherscan-api').init('8Y9RUZZQEWRGRBB9PFHJA4TWGYAEIRY5ZE');
const  {ethers, signer} = require("ethers");
const Web3 = require('web3');
const url_infura = 'https://mainnet.infura.io/v3/dcfc9e54a3724a5ca9db13cdbaf0a571';

// setup web3
const web3Provider = new Web3.providers.HttpProvider(url_infura);
const web3 = new Web3(web3Provider);

router.get("/", async (req, res) => {
    res.send({ data: 'ETH' });
});

router.post("/account", async (req, res) => {
    // create ETH Account
    const wallet = ethers.Wallet.createRandom();
    let data = {
        "account": {
            "privateKey": wallet.privateKey,
            "address": wallet.address
        },
        "phase": wallet.mnemonic.phrase
    }
    res.status(201)
    res.set('content-type', 'application/json');
    res.send(data);
})

router.post("/wallet/import/private", async (req, res) => {
    let pkey = req.body.pkey;
    const account = await web3.eth.accounts.privateKeyToAccount(pkey);
    let send_data = {
        "privateKey": account.privateKey,
        "address": account.address
    }
    res.status(200)
    res.set('content-type', 'application/json');
    res.send(send_data);
})

router.post("/wallet/import/phase", async (req, res) => {
    let mkey = req.body.mkey;
    const account = ethers.Wallet.fromMnemonic(mkey);
    if (account.privateKey) {
        let data = {
            "privateKey": account.privateKey,
            "address": account.address,
            "phase": account.mnemonic.phrase
        }
        console.log(data);
        res.status(200)
        res.set('content-type', 'application/json');
        res.send(data);
    } else {
        res.status(404)
        res.set('content-type', 'application/json');
        res.send({ status: 404, massage: "Wrong Phase" })
    }
})

router.post("/wallet/details", async (req, res) => {
    if (web3.utils.isAddress(req.body.address)){
        var balance = etherscan.account.balance(req.body.address);
        balance.then((balanceData) => {
            res.status(200)
            res.set('content-type', 'application/json');
            res.send(balanceData)
        });
    }else{
        res.status(404)
        res.set('content-type', 'application/json');
        res.send({ status: 404, massage: "Wrong Address" })
    }
})

router.post("/wallet/details/token", async (req, res) => {
    if (web3.utils.isAddress(req.body.address)){
        var balance = etherscan.account.tokenbalance(req.body.address,'',req.body.c_address);
        balance.then((balanceData) => {
            res.status(200)
            res.set('content-type', 'application/json');
            res.send(balanceData)
        });
    }else{
        res.status(404)
        res.set('content-type', 'application/json');
        res.send({ status: 404, massage: "Wrong Address" })
    }
})

router.post("/wallet/send", async (req, res) => {
    const privatekey = req.body.privateKey;
    const wallet = new ethers.Wallet(privatekey, provider);

    const to_account= req.body.to_account                                    //reciver
    const from_account = req.body.from_account                              //sender

    const amountToSend = toPlainString(req.body.amount)
    
    const tx ={
        to: to_account,
        value: ethers.utils.parseEther(amountToSend),
        gasLimit: '0x5208',
    };
    const balance = await provider.getBalance(from_account)
    console.log(ethers.utils.formatEther(balance))
    wallet.sendTransaction(tx)
        .then((txObj) => {
            res.status(200)
            res.set('content-type', 'application/json');
            res.send(txObj)
        }).catch((err) => {
                console.log("error:", err);
                res.status(400)
                res.set('content-type', 'application/json');
                res.send(err)
        });


    function toPlainString(num) {
        return (''+ +num).replace(/(-?)(\d*)\.?(\d*)e([+-]\d+)/,
          function(a,b,c,d,e) {
            return e < 0
              ? b + '0.' + Array(1-e-c.length).join(0) + c + d
              : b + c + d + Array(e-d.length+1).join(0);
          });
      }

})

router.post("/token/send", async (req, res) => {
    const privatekey = req.body.privateKey;

    const infuraEndpoint='https://mainnet.infura.io/v3/71eea7db05714ecdaaa57001480c8ea7';
    const web3 = new Web3(new Web3.providers.HttpProvider(infuraEndpoint));

    const token_address = req.body.c_address;
    var abi = await axios.get(`https://api.etherscan.io/api?module=contract&action=getabi&address=${token_address}&apikey=4H9HPQ1GPGHIAG3D58Y4RPPI4AE6NGA4U8`)
    console.log(typeof JSON.parse(abi.data.result));

    const contract = new web3.eth.Contract(JSON.parse(abi.data.result), token_address);

    const senderAccount = web3.eth.accounts.privateKeyToAccount(privatekey);


    const to_account= req.body.to_account                                    //reciver
    const from_account = req.body.from_account                              //sender

    const amountToSend = web3.utils.toWei(req.body.amount, 'ether')

    const txObject = {
        from: senderAccount.address,
        to: token_address,
        gas: 200000,
        data: contract.methods.transfer(to_account, amountToSend).encodeABI()
    };

    senderAccount.signTransaction(txObject)
    .then(signedTx => {
        web3.eth.sendSignedTransaction(signedTx.rawTransaction)
        .on('receipt', console.log);
    });

    function toPlainString(num) {
        return (''+ +num).replace(/(-?)(\d*)\.?(\d*)e([+-]\d+)/,
          function(a,b,c,d,e) {
            return e < 0
              ? b + '0.' + Array(1-e-c.length).join(0) + c + d
              : b + c + d + Array(e-d.length+1).join(0);
          });
      }

})

module.exports = router;

