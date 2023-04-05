const express = require('express');
const axios = require("axios");
const router = express.Router();
// const WalletConnectWallet  = require('@tronweb3/walletconnect-tron');
// const WalletConnectChainID  = require('@tronweb3/walletconnect-tron');


router.get("/", async (req, res) => {
    res.send({ data: 'dapp' });
});

/////////////////////////////// DAPP CONNECT //////////////////////////////

// router.get("/connect/", async (req, res) => {
//   const wallet = new WalletConnectWallet({
//     network: WalletConnectChainID.Mainnet,
//     options: {
//       relayUrl: 'wss://relay.walletconnect.com',
//       projectId: '....',
//       metadata: {
//         name: 'JustLend',
//         description: 'JustLend WalletConnect',
//         url: 'https://app.justlend.org/',
//         icons: ['https://app.justlend.org/mainLogo.svg']
//       }
//     }
//   })
// })

router.get("/connect/", async (req, res) => {
  const walletconnectAdapter = new WalletConnectAdapter();
  await walletconnectAdapter.connect();
  await walletconnectAdapter.signMessage(message);
})


module.exports = router;