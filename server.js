const express = require('express');
const fs = require('fs');
const cron = require('node-cron');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// File paths
const balanceFile = './data/balance.json';
const transactionsFile = './data/transactions.json';
const creditCardsFile = './data/creditCards.json';

// Utility functions
const readJSON = (file) => JSON.parse(fs.readFileSync(file, 'utf-8'));
const writeJSON = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');

// Data Access
const getBalance = () => readJSON(balanceFile);
const updateBalance = (balance) => writeJSON(balanceFile, { amount: balance });
const getTransactions = () => readJSON(transactionsFile);
const getCreditCards = () => readJSON(creditCardsFile);

const addTransaction = (amount, type, description) => {
  const transactions = getTransactions();
  transactions.push({ amount, type, description, timestamp: new Date() });
  writeJSON(transactionsFile, transactions);
};

const addCreditCard = (cardName, limit, currentBalance, reminderDate) => {
  const creditCards = getCreditCards();
  creditCards.push({ cardName, limit, currentBalance, reminderDate, notified: [] });
  writeJSON(creditCardsFile, creditCards);
};

// Routes
app.get('/api/balance', (req, res) => {
  res.json(getBalance());
});

app.post('/api/transaction', (req, res) => {
  const { amount, type, description } = req.body;
  const balance = getBalance().amount;
  const newBalance = type === 'INCOME' ? balance + amount : balance - amount;
  updateBalance(newBalance);
  addTransaction(amount, type, description);
  res.status(200).json({ message: 'Transaction added' });
});

app.get('/api/transactions', (req, res) => {
  res.json(getTransactions());
});

app.get('/api/creditCards', (req, res) => {
  res.json(getCreditCards());
});

app.post('/api/creditCard', (req, res) => {
  const { cardName, limit, currentBalance, reminderDate } = req.body;
  addCreditCard(cardName, limit, currentBalance, reminderDate);
  res.status(200).json({ message: 'Credit card reminder added' });
});

app.post('/api/splitTransaction', (req, res) => {
  const { totalMoney, noOfPeople, type, description } = req.body;

  if (!totalMoney || !noOfPeople || !type || !description) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const amountPerPerson = totalMoney / noOfPeople;
  const splitDescription = `${description} (Split among ${noOfPeople} people)`;

  addTransaction(amountPerPerson, type, splitDescription);

  const balance = getBalance().amount;
  const newBalance = type === 'INCOME'
    ? balance + amountPerPerson
    : balance - amountPerPerson;

  updateBalance(newBalance);

  res.status(200).json({ message: 'Split transaction recorded for one person only' });
});

// Daily Cron Job - Credit Card Reminder Checks
cron.schedule('0 10 * * *', () => {
  const creditCards = getCreditCards();
  const today = new Date();

  creditCards.forEach(card => {
    const reminderDate = new Date(card.reminderDate);
    const daysDiff = Math.ceil((reminderDate - today) / (1000 * 60 * 60 * 24));

    if ([7, 1, 0].includes(daysDiff) && !card.notified.includes(daysDiff)) {
      card.notified.push(daysDiff);
    }
  });

  writeJSON(creditCardsFile, creditCards);
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
