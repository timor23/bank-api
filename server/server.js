const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const clientsFile = './clients.json';
let firstAccountNum = 1200001;


const app = express();
// app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    const buffer = JSON.parse(fs.readFileSync(clientsFile).toString());
    res.status(200).json(buffer);
})

app.post('/', (req, res) => {
    let buffer = JSON.parse(fs.readFileSync(clientsFile).toString());
    if (buffer.find(client => {
        return req.body.id === client.id
    })) {
        return res.status(404).send('Client with the same Id already exist');
    }
    console.log(req.body.id)
    const client = {
        account: buffer.length + firstAccountNum,
        id: req.body.id,
        name: req.body.name,
        email: req.body.email,
        credit: req.body.credit,
        balance: req.body.balance,
        isActive: true
    }

    buffer = [...buffer, client];
    fs.writeFileSync(clientsFile, JSON.stringify(buffer));
    return res.status(209).json({client: client});
})

app.put('/:action/:accountNum', (req, res) => {
    const {action, accountNum} = req.params;
    let buffer = JSON.parse(fs.readFileSync(clientsFile).toString());
    const account = buffer.find((client) => {
        return accountNum == client.account
    });
    console.log(account.balance)
    if (!account) {
        return res.status(404).send("Account doesn't exist");
    }

    switch (action) {
        case 'deposit':
            console.log("sss")
            if (!account.isActive) {
                return res.status(404).send('Account is not active');
            }
            account.balance += req.body.amount;
            console.log(account.balance)
            break;
        case 'withdraw':
            if (!account.isActive) {
                return res.status(404).send('Account is not active');
            }
            if ((account.balance + account.credit) < req.body.amount) {
                return res.status(404).send('Not enough money');
            }
            account.balance -= req.body.amount;
            break;
        case 'credit':
            account.credit = req.body.credit;
            break;
    }
    fs.writeFileSync(clientsFile, JSON.stringify(buffer));
    return res.status(200).json({success: 'OK'});
})

app.put('./transfer/:fromAccount/:toAccount', (rew,res)=>{
    const {fromAccount, toAccount} = req.params;
    let buffer = JSON.parse(fs.readFileSync(clientsFile).toString());
    const account1 = buffer.find((client) => {
        return fromAccount == client.account
    });
    const account2 = buffer.find((client) => {
        return toAccount == client.account
    });

    if (!account1.isActive || !account2.isActive) {
        return res.status(404).send('Account is not active');
    }
    if ((account2.balance + account2.credit) < req.body.amount) {
        return res.status(404).send('Not enough money');
    }
    account1.balance -= req.body.amount;
    account2.balance += req.body.amount;

    fs.writeFileSync(clientsFile, JSON.stringify(buffer));
    return res.status(200).json({success: 'OK'});
})

app.listen(5001, () => {
    console.log('listening on port 5001')
});