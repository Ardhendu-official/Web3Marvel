const express = require('express');
const router = express.Router();

const home = require('./home');
const tron = require('./tron');
const swap = require('./swap');
const dapp = require('./dapp');
const bnb = require('./bnb');
const eth = require('./eth');
const poly = require('./polygon');
const sol = require('./solana');

router.use('/', home)
router.use('/tron', tron)
router.use('/swap', swap)
router.use('/dapp', dapp)
router.use('/bnb', bnb)
router.use('/eth', eth)
router.use('/polygon', poly)
router.use('/solana', sol)

module.exports = router;