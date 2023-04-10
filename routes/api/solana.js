const express = require('express');
const router = express.Router();
const axios = require("axios")

const nacl = require('tweetnacl');
const { Keypair, PublicKey } = require('@solana/web3.js');
const bip39 = require('bip39');
const bs58 = require('bs58');
const { randomBytes } = require('crypto');


router.get("/", async (req, res) => {
    res.send({ data: 'solana' });
});

router.post("/account", async (req, res) => {
    try {
        const mnemonic = bip39.entropyToMnemonic(randomBytes(16).toString('hex'));
        const seed = await bip39.mnemonicToSeedSync(mnemonic).slice(0, 32);
        const keypair = await Keypair.fromSeed(seed);
        const privateKey = await bs58.encode(Buffer.from(keypair.secretKey))
        const publicKey = await keypair.publicKey.toBase58()
        let data = {
          "account": {
            "privateKey": privateKey,
            "address": publicKey
          },
          "phase": mnemonic
        }
        res.status(201)
        res.set('content-type', 'application/json');
        res.send(data);
      } catch (error) {
        console.error(error);
        res.status(500);
        res.send({ error: 'An error occurred while creating the Solana wallet address.' });
      }
})

router.post("/wallet/import/private", async (req, res) => {
    let pkey = req.body.pkey;
    const kepair = Keypair.fromSecretKey(bs58.decode(pkey));
    const privateKey = bs58.encode(Buffer.from(kepair.secretKey))
    const publicKey = kepair.publicKey.toBase58()
    let send_data = {
        "privateKey": privateKey,
        "address": publicKey
    }
    res.status(200)
    res.set('content-type', 'application/json');
    res.send(send_data);
})

router.post("/wallet/import/phase", async (req, res) => {
    const mnemonic = req.body.mkey;
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const keypair = nacl.sign.keyPair.fromSeed(seed.slice(0, 32));
    const publicKey = bs58.encode(Buffer.from(keypair.publicKey));
    const privateKey = bs58.encode(Buffer.from(keypair.secretKey));
    let data = {
        "privateKey": privateKey,
        "address": publicKey,
        "phase": mnemonic
    }
    res.status(200)
    res.set('content-type', 'application/json');
    res.send(data);

})

router.post("/wallet/details", async (req, res) => {
    const address = req.body.address;
    const resp = await fetch(
    `https://api.tatum.io/v3/solana/account/balance/${address}`,
    {
        method: 'GET',
        headers: {
        'x-api-key': '2b1b4d23-7607-4fdd-b0aa-05cedd97cf83'
        }
    }
    );
    const data = await resp.text();
    res.status(200)
    res.set('content-type', 'application/json');
    res.send(data);

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
            from:  req.body.from_account ,
            to: req.body.to_account,
            amount: toPlainString(req.body.amount),
            fromPrivateKey: req.body.privateKey
          })
        }
    );
    const data = await resp.json();
    console.log(data);
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
