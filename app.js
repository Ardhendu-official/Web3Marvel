const express = require('express');
const config = require('./config');
const app = express();
const routes = require('./routes');

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use('/', routes);

app.listen(config.PORT, () => {
    console.log(`API Listening on port ${config.PORT}`)
})
