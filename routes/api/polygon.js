const express = require('express');
const router = express.Router();
const axios = require("axios")

const Web3 = require('web3');
const Polygonscan = require('polygonscan-api').init('3TNSCHHWIE9UHGRM1QMI3XEV4Y5SJJKNJ8');
const  {Wallet, ethers} = require("ethers");
const web3 = new Web3(new Web3.providers.HttpProvider('https://polygon-mainnet.infura.io/v3/dcfc9e54a3724a5ca9db13cdbaf0a571'));
const w3 = new Web3('https://rpc-mainnet.maticvigil.com/');


router.get("/", async (req, res) => {
    res.send({ data: 'polygon' });
});

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

router.post("/wallet/import/private", async (req, res) => {
    let pkey = req.body.pkey;
    const account = web3.eth.accounts.privateKeyToAccount(pkey);
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
        var balance = Polygonscan.account.balance(req.body.address);
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
    const p_key = req.body.from_account 
    const resp = await fetch(
        `https://api.tatum.io/v3/polygon/transaction`,
        {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': '2b1b4d23-7607-4fdd-b0aa-05cedd97cf83'
        },
        body: JSON.stringify({
            to:  req.body.to_account,
            currency: 'MATIC',
            amount: toPlainString(req.body.amount),
            fromPrivateKey: req.body.privateKey
        })
        }
    );
    const data = await resp.json();
    res.status(200)
    res.set('content-type', 'application/json');
    res.send(data)
  
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