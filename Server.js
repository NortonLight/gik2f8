const express = require('express');
const app = express();
const port = 3000;
const route = require('./route');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended : false}));
app.use(express.json());
app.use(express.static('./front-end'))




app.use('/', route);
app.listen(port, () => {
    console.log(`Lyssnar nu på: http://localhost:${port}`);
});