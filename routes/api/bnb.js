const Web3 = require('web3');
const { Wallet, providers, ethers } = require("ethers");
const BscScanApi = require("bscscan-api").init("IWFZ9GJ1HMINPGD65Q2GZDDPTJNHJJFEUY");
const web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed.binance.org/'));

const express = require('express');
const axios = require("axios")
const router = express.Router();
const fs = require('fs');
const JWT = require('jsonwebtoken');

router.get("/", async (req, res) => {
    res.send({ data: 'binance' });
});


/////////////////////////////// CREATE ACCOUNT WITH PHASE //////////////////////////////

router.post("/account", async (req, res) => {
    const wallet = Wallet.createRandom();
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

// /////////////////////////////// IMPORT WALLET FROM PRIVATE KEY //////////////////////////////

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

// /////////////////////////////// IMPORT WALLET FROM PHASE //////////////////////////////

router.post("/wallet/import/phase", async (req, res) => {
    let mkey = req.body.mkey;
    const account = Wallet.fromMnemonic(mkey);
    if (account.privateKey) {
        let data = {
            "privateKey": account.privateKey,
            "address": account.address,
            "phase": account.mnemonic.phrase
        }
        // console.log(data);
        res.status(200)
        res.set('content-type', 'application/json');
        res.send(data);
    } else {
        res.status(404)
        res.set('content-type', 'application/json');
        res.send({ status: 404, massage: "Wrong Phase" })
    }
})

// /////////////////////////////// GET DETAILS WITH ADDRESS //////////////////////////////

router.post("/wallet/details", async (req, res) => {
    const walletAddress = req.body.address;
    if (web3.utils.isAddress(req.body.address)){
        var balance = BscScanApi.account.balance(walletAddress);
        balance.then(function (balanceData) {
        console.log(balanceData);
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
        var balance = BscScanApi.account.tokenbalance(req.body.address,'',req.body.c_address);
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
    const to_account= req.body.to_account                                    //reciver
    const from_account = req.body.from_account                              //sender
    const amountToSend = toPlainString(req.body.amount)
    const networkId = await web3.eth.net.getId();
    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = '21000';
    
    const tx = {
        from: from_account,
        to: to_account,
        value: web3.utils.toHex(web3.utils.toWei(amountToSend, 'ether')),
        gas: web3.utils.toHex(21000),
        gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
        nonce: web3.utils.toHex(await web3.eth.getTransactionCount(from_account)),
        chainId: 56
    };
    console.log(tx);
    const signedTx = await web3.eth.accounts.signTransaction(tx, privatekey);
    console.log(signedTx);
    await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
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
    const privateKey = req.body.privateKey; // Sender's private key
    const tokenContractAddress  = req.body.c_address; // Token contract address
    const fromAddress = req.body.from_account; // Sender's address
    const toAddress = req.body.to_account; // Receiver's address
    const amount = toPlainString(req.body.amount); // Amount to send (1 token)

    const txObject = {
        from: fromAddress,
        to: tokenContractAddress,
        gasPrice: web3.utils.toHex(await web3.eth.getGasPrice()), // Use current gas price
        gasLimit: web3.utils.toHex(100000), // Gas limit for a token transfer
        nonce: web3.utils.toHex(await web3.eth.getTransactionCount(fromAddress)), // Use the sender's nonce
        data: web3.eth.abi.encodeFunctionCall({
          name: 'transfer',
          type: 'function',
          inputs: [{
            type: 'address',
            name: 'to'
          }, {
            type: 'uint256',
            name: 'value'
          }]
        }, [toAddress, amount])
      };
      
      const signedTx = await web3.eth.accounts.signTransaction(txObject, privateKey);
      
      try {
        const result = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log(`Transaction hash: ${result.transactionHash}`);
        res.status(200)
        res.set('content-type', 'application/json');
        res.send(result.transactionHash)
      } catch (error) {
        console.error(`Error sending transaction: ${error}`);
            res.status(400)
            res.set('content-type', 'application/json');
            res.send(error)
      }

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