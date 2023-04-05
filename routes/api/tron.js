const express = require('express');
const TronWeb = require('tronweb');
const HttpProvider = TronWeb.providers.HttpProvider;
const hdWallet = require('tron-wallet-hd');
const keyStore = hdWallet.keyStore;
const utils = hdWallet.utils;
const axios = require("axios")
const fullNode = 'https://api.trongrid.io';
const solidityNode = 'https://api.trongrid.io';
const eventServer = 'https://api.trongrid.io';
const privateKey = 'e7cecde2fc34befa95e21fcc9806dc118d9a01a3450d637bd5a817fbc64a284c';
const API_Key = '8f385928-3601-426c-96b4-18b629adb023'
const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
tronWeb.setHeader({ "TRON-PRO-API-KEY": API_Key });
const router = express.Router();

// tronweb.setHeader({ "TRON-PRO-API-KEY": API_Key });
const fs = require('fs');
const JWT = require('jsonwebtoken');

router.get("/", async (req, res) => {
    res.send({ data: 'tron' });
});

/////////////////////////////// CREATE ACCOUNT WITH PHASE //////////////////////////////

router.post("/account", async (req, res) => {
    let seed = await utils.generateMnemonic();
    let accounts = await utils.generateAccountsWithMnemonic(seed, 1);
    let data = {
        "account": {
            "privateKey": accounts[0].privateKey,
            "address": accounts[0].address
        },
        "phase": seed
    }
    res.status(201)
    res.set('content-type', 'application/json');
    res.send(data);
})

/////////////////////////////// CREATE RANDOM WITH PHASE (DEPCRICATED) //////////////////////////////

router.post("/wallet", async (req, res) => {
    let data = await tronWeb.createRandom({ path: "m/44'/195'/0'/0/2", extraEntropy: '', locale: 'en' });
    let final_data = {
        "mnemonic": {
            "phrase": data.mnemonic.phrase,
            "path": "m/44'/195'/0'/0/2",
            "locale": "en"
        },
        "privateKey": tronWeb.fromUtf8(data.privateKey),
        "publicKey": tronWeb.toAscii(data.publicKey),
        "privateey": tronWeb.toUtf8(tronWeb.fromUtf8(data.privateKey)),
        "publicey": tronWeb.fromAscii(tronWeb.toAscii(data.publicKey)),
        "address": data.address
    }
    res.status(404)
    res.set('content-type', 'application/json');
    res.send({ status: 404, massage: "Reaquiest can't process" })
})

/////////////////////////////// GET DETAILS WITH ADDRESS //////////////////////////////

router.post("/wallet/details", async (req, res) => {
    let url = `https://apilist.tronscan.org/api/account?address=${req.body.address}`;
    if (tronWeb.isAddress(req.body.address)) {
        await axios.get(url).then((data) => {
            res.status(200)
            res.set('content-type', 'application/json');
            res.send(data.data)
        }).catch(e => {
            res.status(404)
            res.set('content-type', 'application/json');
            res.send({ status: 404, massage: "Enter Valid Address" })
            console.log(e)
        })
    } else {
        res.status(404)
        res.set('content-type', 'application/json');
        res.send({ status: 404, massage: "Wrong Address" })
    }
})

/////////////////////////////// GET DETAILS WITH PRIVATE KEY //////////////////////////////

router.post("/wallet/details", async (req, res) => {
    let addtess = await tronWeb.address.fromPrivateKey(req.body.privateKey);
    let url = `https://apilist.tronscan.org/api/account?address=${addtess}`;
    if (tronWeb.isAddress(req.body.address)) {
        await axios.get(url).then((data) => {
            let send_data = {
                'address': address,
                'details': data.data
            }
            res.status(200)
            res.set('content-type', 'application/json');
            res.send(send_data)
        }).catch(e => {
            res.status(404)
            res.set('content-type', 'application/json');
            res.send({ status: 404, massage: "Enter Valid Address" })
            console.log(e)
        })
    } else {
        res.status(404)
        res.set('content-type', 'application/json');
        res.send({ status: 404, massage: "Wrong Address" })
    }
})

/////////////////////////////// IMPORT WALLET FROM PHASE //////////////////////////////

router.post("/wallet/import/phase", async (req, res) => {
    let phase = req.body.phase;
    // let data = await tronWeb.address.fromPrivateKey(pKey)
    if (utils.validateMnemonic(phase)) {
        let data = await utils.getAccountAtIndex(phase)
        res.set('content-type', 'application/json');
        res.send(data);
    } else {
        res.status(404)
        res.set('content-type', 'application/json');
        res.send({ status: 404, massage: "Wrong Phase" })
    }
})

/////////////////////////////// IMPORT WALLET FROM PRIVATE KEY //////////////////////////////

router.post("/wallet/import/private", async (req, res) => {
    let pkey = req.body.pkey;
    if (utils.validatePrivateKey(pkey)) {
        let data = await utils.getAccountFromPrivateKey(pkey);
        let send_data = {
            "privateKey": pkey,
            "address": data
        }
        res.status(200)
        res.set('content-type', 'application/json');
        res.send(send_data);
    } else {
        res.status(404)
        res.set('content-type', 'application/json');
        res.send({ status: 404, massage: "Wrong Private Key" })
    }
})

/////////////////////////////// FETCH BALANCE FROM ADDRESS //////////////////////////////

router.post("/wallet/balance", async (req, res) => {
    let url = `https://apilist.tronscan.org/api/account?address=${req.body.address}`;
    if (tronWeb.isAddress(req.body.address)) {
        await axios.get(url).then((data) => {
            let send_data = {
                'address': req.body.address,
                'details': data.data.tokens
            }
            res.status(200)
            res.set('content-type', 'application/json');
            res.send(send_data)
        }).catch(e => {
            res.status(404)
            res.set('content-type', 'application/json');
            res.send({ status: 404, massage: "Enter Valid Address" })
            console.log(e)
        })
    } else {
        res.status(404)
        res.set('content-type', 'application/json');
        res.send({ status: 404, massage: "Wrong Address" })
    }
})

/////////////////////////////// IS PHASE //////////////////////////////

router.post("/isphase", async (req, res) => {
    if (utils.validateMnemonic(req.body.phase)) {
        res.status(200)
        res.set('content-type', 'application/json');
        res.send({ status: true, massage: "It's a Phase" })
    } else {
        res.status(400)
        res.set('content-type', 'application/json');
        res.send({ status: false, massage: "It's not a Phase" })
    }
})

/////////////////////////////// SEND TRX (TESTING) //////////////////////////////

async function verifySign() {
    var privateKEY = fs.readFileSync('./private.pem', 'utf8');
    var publicKEY = fs.readFileSync('./public.pem', 'utf8');

    var header = {
        algorithm: "RS256",
        "typ": "JWT",
        "kid": "e09bca80af19466da9c4360c3a0244f1"
    };

    let payload = {
        "exp": 1617736153,
        "aud": "trongrid.io"
    }

    let token = JWT.sign(payload, privateKEY, header);

    console.log("Generated token = " + token);

    return token;
}

async function sendTRX(fromAddress, toAddress, amount, privateKey, AppKey) {

    let tocken = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImUwOWJjYTgwYWYxOTQ2NmRhOWM0MzYwYzNhMDI0NGYxIn0.eyJleHAiOiIxMkgiLCJhdWQiOiJ0cm9uZ3JpZC5pbyJ9.Sp2vx5LumfEMxoGtEY0v7eDwlEY9CQ43_I37mWev7VyRTA6C-1ZlWVLcx7fHFtGXQiULBMXGvhQMt8ieCyWj9dPxOdwDzxQivuF9W1MH-BlaJVO2TXsaimtr4VNjQ_JCuw6CCZGz1pfMbj7r54A48d93TMOmsd20kO4CzH_631H6SRviw2J7aZLeI22Jyx8GAfNMgRnTa8lvoW2D7ecZN3-Gppkh-6CxLOarn5K_7ERu349V9qnNMkW1NIkL50WBZpanTRsRobUXNi0rayaIl7K5j0z-aezay9fdc5T3RX-5Da9Q4XN-RdVdpLw4GriG-SDT_QalTehT_53_wogQ_g`;

    const tronWebSend = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
    tronWebSend.setHeader({ "TRON-PRO-API-KEY": API_Key });
    tronWebSend.setHeader({ "Authorization": `Bearer ${tocken}` });

    console.log(tronWeb.address.toHex(fromAddress) + " => " + tronWeb.address.toHex(toAddress))

    var tradeobj = '';

    await tronWebSend.transactionBuilder.sendTrx(toAddress, amount, fromAddress, 1).then(async (data) => {
        tradeobj = data;
    }).catch(e => {
        console.log(e)
    });

    const signedtxn = await tronWebSend.trx.sign(
        tradeobj,
        privateKey
    );

    const receipt = await tronWebSend.trx.sendRawTransaction(
        signedtxn
    );

    return receipt;
}

async function getDetails(hash){
    await axios.get(`https://apilist.tronscan.org/api/transaction?hash=${hash}`).then((data) => {
        console.log(`https://apilist.tronscan.org/api/transaction?hash=${hash}`)
        console.log(hash)
        console.log(data.data)
        return data.data;
    })
}

router.post("/wallet/send", async (req, res) => {
    sendTRX(req.body.from_account, req.body.to_account, req.body.amount, req.body.privateKey, API_Key).then((data) => {
        res.status(200)
        res.set('content-type', 'application/json');
        res.send(data)
    }).catch((err) => {
        console.log("error:", err);
        res.status(400)
        res.set('content-type', 'application/json');
        res.send(err)
    });
})

router.post("/token/send", async (req, res) => {

    let tocken = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImUwOWJjYTgwYWYxOTQ2NmRhOWM0MzYwYzNhMDI0NGYxIn0.eyJleHAiOiIxMkgiLCJhdWQiOiJ0cm9uZ3JpZC5pbyJ9.Sp2vx5LumfEMxoGtEY0v7eDwlEY9CQ43_I37mWev7VyRTA6C-1ZlWVLcx7fHFtGXQiULBMXGvhQMt8ieCyWj9dPxOdwDzxQivuF9W1MH-BlaJVO2TXsaimtr4VNjQ_JCuw6CCZGz1pfMbj7r54A48d93TMOmsd20kO4CzH_631H6SRviw2J7aZLeI22Jyx8GAfNMgRnTa8lvoW2D7ecZN3-Gppkh-6CxLOarn5K_7ERu349V9qnNMkW1NIkL50WBZpanTRsRobUXNi0rayaIl7K5j0z-aezay9fdc5T3RX-5Da9Q4XN-RdVdpLw4GriG-SDT_QalTehT_53_wogQ_g`;

    const fromAddress = req.body.from_account;
    const privateKey = req.body.privateKey;
    const toAddress = req.body.to_account;
    const amount = req.body.amount; // Replace with the amount of tokens you want to send
    const tokenAddress = req.body.c_address; // Replace with the address of the token contract

    const tronWebToken = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
    tronWebToken.setHeader({ "TRON-PRO-API-KEY": API_Key });
    tronWebToken.setHeader({ "Authorization": `Bearer ${tocken}` });

    // const contract = await tronWebToken.contract().at(tokenAddress);
    // const decimals = await contract.decimals().call();
    // const amountWithDecimals = amount * 10 ** decimals;

    // console.log(contract);
    // console.log(JSON.parse(decimals));  
    // console.log(JSON.parse(amountWithDecimals));  
    // const options = {
    //     feeLimit: 100000000,
    //   };
    // const transaction = await contract.transfer(toAddress, amountWithDecimals).send(options, privateKey);
    // console.log(transaction);
    // .send({
    //     from: fromAddress,
    //     feeLimit: 100000000, // Replace with your own fee limit
    //     callValue: 0
    // });
    // console.log(transaction);  

    // const signedTransaction = await tronWebToken.trx.sign(transaction, privateKey);
    // const receipt = await tronWebToken.trx.sendRawTransaction(signedTransaction);
    
    // console.log(receipt);
    // res.send(JSON.stringify.receipt)

    tronWebToken.contract().at(tokenAddress).then(contract => {
        contract.transfer(toAddress, amount).send().then(result => {
            console.log(result);
        }).catch(error => {
            console.error(error);
        });
    }).catch(error => {
        console.error(error);
    });




})

module.exports = router;