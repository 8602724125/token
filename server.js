const express = require("express")
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const router = express.Router()
const config = require('./config.json')
const app = express()

const tokenList = {};

app.use(bodyParser.json())
app.use("/api", router)

router.get('/', (req, res) => {
    res.send("Hello World!");
})

router.post('/login', (req, res) => {
    const postData = req.body;
    const user = {
      "email" : req.body.email,
      "password" : req.body.password
    } 
    const token = jwt.sign({user}, config.secret, {expiresIn: config.tokenLife})
    const refreshToken = jwt.sign({user}, config.refreshTokenSecret, {expiresIn: config.refreshTokenLife})
    const response = {
        "status": "Logged in",
        "token": token,
        "refreshToken": refreshToken,
    }
    tokenList[refreshToken] = response
    console.log("tokenList: ", tokenList)
    res.status(200).json(response);
})

router.post('/token', (req, res) => {
    const postData = req.body
    console.log("condition: ", (postData.refreshToken) && (postData.refreshToken in tokenList))
    if((postData.refreshToken) && (postData.refreshToken in tokenList)) {
        const user = {
            "email": postData.email,
            "name": postData.name
        }
        const token = jwt.sign(user, config.secret, { expiresIn: config.tokenLife})
        const response = {
            "token": token,
        }
        // update the token in the list
        tokenList[postData.refreshToken].token = token
        res.status(200).json(response);        
    } else {
        res.status(404).send('Invalid request')
    }
})

router.get('/abcd', (req, res) => {
    res.send("Hello World! abcd");
})

router.use(require('./tokenChecker'))  // below this middleware need token to access route

router.get('/secure', (req,res) => {
    // all secured routes goes here
    res.send('I am secured...')
})

router.get('/abc', (req, res) => {
    res.send("Hello World! abc");
})

app.listen(config.port || process.env.port || 3000, () => {
    console.log("Server is running")
});