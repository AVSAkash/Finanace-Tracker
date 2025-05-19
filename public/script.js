// Update Balance
function updateBalance() {
  fetch('/api/balance')
    .then(res => res.json())
    .then(data => {
      document.getElementById('balance').innerText = data.amount;
    })
    .catch(err => {
      console.error(err);
      alert('Error fetching balance');
    });
}

// Update Transactions
function updateTransactions() {
  fetch('/api/transactions')
    .then(res => res.json())
    .then(data => {
      const table = document.getElementById('transactionsTable');
      table.innerHTML = '<tr><th>Amount</th><th>Type</th><th>Description</th><th>Timestamp</th></tr>';
      data.forEach(({ amount, type, description, timestamp }) => {
        const row = table.insertRow();
        row.insertCell(0).innerText = amount;
        row.insertCell(1).innerText = type;
        row.insertCell(2).innerText = description;
        row.insertCell(3).innerText = new Date(timestamp).toLocaleString();
      });
    })
    .catch(err => {
      console.error(err);
      alert('Error fetching transactions');
    });
}

// Update Credit Cards
function updateCreditCards() {
  fetch('/api/creditCards')
    .then(res => res.json())
    .then(data => {
      const table = document.getElementById('creditCardsTable');
      table.innerHTML = '<tr><th>Card Name</th><th>Limit</th><th>Current Balance</th><th>Reminder Date</th></tr>';
      data.forEach(({ cardName, limit, currentBalance, reminderDate }) => {
        const row = table.insertRow();
        row.insertCell(0).innerText = cardName;
        row.insertCell(1).innerText = limit;
        row.insertCell(2).innerText = currentBalance;
        row.insertCell(3).innerText = new Date(reminderDate).toLocaleString();
      });
    })
    .catch(err => {
      console.error(err);
      alert('Error fetching credit cards');
    });
}

// Handle Add Transaction
document.getElementById('transactionForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const amount = parseFloat(document.getElementById('amount').value);
  const type = document.getElementById('type').value;
  const description = document.getElementById('description').value.trim();

  if (!amount || !description) return alert('Invalid input');

  fetch('/api/transaction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, type, description }),
  }).then(res => {
    if (!res.ok) throw new Error();
    updateBalance();
    updateTransactions();
    document.getElementById('transactionForm').reset();
  }).catch(err => {
    console.error(err);
    alert('Error adding transaction');
  });
});

// Handle Split Transaction
document.getElementById('splitTransactionForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const totalMoney = parseFloat(document.getElementById('totalMoney').value);
  const noOfPeople = parseInt(document.getElementById('noOfPeople').value);
  const type = document.getElementById('splitType').value;
  const description = document.getElementById('splitDescription').value.trim();

  if (!totalMoney || !noOfPeople || !description) return alert('Invalid input');

  fetch('/api/splitTransaction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ totalMoney, noOfPeople, type, description }),
  }).then(res => {
    if (!res.ok) throw new Error();
    updateBalance();
    updateTransactions();
    document.getElementById('splitTransactionForm').reset();
  }).catch(err => {
    console.error(err);
    alert('Error adding split transaction');
  });
});

// Handle Credit Card Reminder
document.getElementById('creditCardForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const cardName = document.getElementById('cardName').value.trim();
  const limit = parseFloat(document.getElementById('limit').value);
  const currentBalance = parseFloat(document.getElementById('currentBalance').value);
  const reminderDate = document.getElementById('reminderDate').value;

  if (!cardName || !limit || !currentBalance || !reminderDate) return alert('Invalid input');

  fetch('/api/creditCard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cardName, limit, currentBalance, reminderDate }),
  }).then(res => {
    if (!res.ok) throw new Error();
    updateCreditCards();
    document.getElementById('creditCardForm').reset();
  }).catch(err => {
    console.error(err);
    alert('Error adding credit card');
  });
});

// Initial Load
updateBalance();
updateTransactions();
updateCreditCards();
