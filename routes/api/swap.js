const express = require('express');
const axios = require("axios")
const router = express.Router();


router.get("/", async (req, res) => {
    res.send({ data: 'swap' });
});

/////////////////////////////// CURRENCY //////////////////////////////

router.get("/curency/", async (req, res) => {
    let curency_name = req.body.name;
    const API_KEY = '61ade498-2c74-48fd-b737-4beebf69dbb9'
    axios.get(`https://api.stealthex.io/api/v2/currency/${curency_name}?api_key=${API_KEY}`).then(function (data) {
        console.log(JSON.stringify(data.data));
        res.status(200)
        res.set('content-type', 'application/json')
        res.send(data.data)
      })
      .catch(function (error) {
        console.log(error);
      });
})

/////////////////////////////// ALL CURRENCY //////////////////////////////

router.get("/curency/all/", async (req, res) => {
    const API_KEY = '61ade498-2c74-48fd-b737-4beebf69dbb9'
    axios.get(`https://api.stealthex.io/api/v2/currency?api_key=${API_KEY}`).then(function (data) {
        console.log(JSON.stringify(data.data));
        res.status(200)
        res.set('content-type', 'application/json')
        res.send(data.data)
      })
      .catch(function (error) {
        console.log(error);
      });
})

/////////////////////////////// PAIR //////////////////////////////

router.get("/pair/", async (req, res) => {
    let curency_name = req.body.name;
    const API_KEY = '61ade498-2c74-48fd-b737-4beebf69dbb9'
    axios.get(`https://api.stealthex.io/api/v2/pairs/${curency_name}?api_key=${API_KEY}`).then(function (data) {
        console.log(JSON.stringify(data.data));
        res.status(200)
        res.set('content-type', 'application/json')
        res.send(data.data)
      })
      .catch(function (error) {
        console.log(error);
      });
})

/////////////////////////////// ALL PAIR (NOT RECOMENDED) //////////////////////////////

router.get("/pair/all/", async (req, res) => {
    const API_KEY = '61ade498-2c74-48fd-b737-4beebf69dbb9'
    axios.get(`https://api.stealthex.io/api/v2/pairs?api_key=${API_KEY}`).then(function (data) {
        console.log(JSON.stringify(data.data));
        res.status(200)
        res.set('content-type', 'application/json')
        res.send(data.data)
      })
      .catch(function (error) {
        console.log(error);
      });
})

/////////////////////////////// ESTIMATED //////////////////////////////

router.get("/estimated/", async (req, res) => {
    let currency_from = req.body.currency_from;
    let currency_to = req.body.currency_to;
    let amount = req.body.amount;
    const API_KEY = '61ade498-2c74-48fd-b737-4beebf69dbb9'
    axios.get(`https://api.stealthex.io/api/v2/estimate/${currency_from}/${currency_to}?amount=${amount}&api_key=${API_KEY}`).then(function (data) {
        console.log(JSON.stringify(data.data));
        res.status(200)
        res.set('content-type', 'application/json')
        res.send(data.data)
      })
      .catch(function (error) {
        console.log(error);
      });
})

/////////////////////////////// MINIMAL //////////////////////////////

router.get("/minimal/", async (req, res) => {
    let currency_from = req.body.currency_from;
    let currency_to = req.body.currency_to;
    const API_KEY = '61ade498-2c74-48fd-b737-4beebf69dbb9'
    axios.get(`https://api.stealthex.io/api/v2/min/${currency_from}/${currency_to}?api_key=${API_KEY}`).then(function (data) {
        console.log(JSON.stringify(data.data));
        res.status(200)
        res.set('content-type', 'application/json')
        res.send(data.data)
      })
      .catch(function (error) {
        console.log(error);
      });
})


/////////////////////////////// RANGE //////////////////////////////

router.get("/range/", async (req, res) => {
    let currency_from = req.body.currency_from;
    let currency_to = req.body.currency_to;
    const API_KEY = '61ade498-2c74-48fd-b737-4beebf69dbb9'
    axios.get(`https://api.stealthex.io/api/v2/range/${currency_from}/${currency_to}?api_key=${API_KEY}`).then(function (data) {
        console.log(JSON.stringify(data.data));
        res.status(200)
        res.set('content-type', 'application/json')
        res.send(data.data)
      })
      .catch(function (error) {
        console.log(error);
      });
})

/////////////////////////////// Exchange information //////////////////////////////

router.get("/exchange/id/", async (req, res) => {
    let exchange_id = req.body.exchange_id;
    const API_KEY = '61ade498-2c74-48fd-b737-4beebf69dbb9'
    axios.get(`https://api.stealthex.io/api/v2/exchange/${exchange_id}?api_key=${API_KEY}`).then(function (data) {
        console.log(JSON.stringify(data.data));
        res.status(200)
        res.set('content-type', 'application/json')
        res.send(data.data)
      })
      .catch(function (error) {
        console.log(error);
      });
})

/////////////////////////////// Exchange create //////////////////////////////

router.post("/exchange/create/", async (req, res) => {
    let currency_from = req.body.currency_from;
    let currency_to = req.body.currency_to;
    let address_to = req.body.address_to;
    let amount_from = req.body.amount_from;
    const API_KEY = '61ade498-2c74-48fd-b737-4beebf69dbb9'
    axios.post(`https://api.stealthex.io/api/v2/exchange?api_key=${API_KEY}`,{
      "currency_from": currency_from,
      "currency_to": currency_to,
      "address_to": address_to,
      "amount_from": amount_from
    }).then(function (data) {
        console.log(JSON.stringify(data.data));
        res.status(200)
        res.set('content-type', 'application/json')
        res.send(data.data)
      })
      .catch(function (error) {
        console.log(error);
      });
})

/////////////////////////////// CHECK //////////////////////////////
 
router.get("/check/", async (req, res) => {
    axios.get(`https://api.simpleswap.io/check_exchanges`).then((data) => {
        res.status(200)
        res.set('content-type', 'application/json')
        res.send(data.data)
    }).catch((e) => { console.log(e) })
})


module.exports = router;