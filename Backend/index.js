
const express = require('express');

const app = express();
const PORT = 3001;

app.use(express.json());

// Temporary transaction storage
let transactions = [
    {
        id: 1,
        description: 'Salary',
        amount: 15000,
        type: 'income',
        category: 'Salary'
    },
    {
        id: 2,
        description: 'Groceries',
        amount: 450,
        type: 'expense',
        category: 'Food'
    },
    {
        id: 3,
        description: 'Transport',
        amount: 80,
        type: 'expense',
        category: 'Transport'
    }
];

// Home endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the FinTrack API!',
        status: 'success'
    });
});

// Get all transactions
app.get('/api/transactions', (req, res) => {
    res.json(transactions);
});

// Create a transaction
app.post('/api/transactions', (req, res) => {
    const { description, amount, type, category } = req.body;

    if (typeof description !== 'string' || description.trim() === '') {
        return res.status(400).json({
            message: 'Description is required.'
        });
    }

    if (
        typeof amount !== 'number' ||
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        return res.status(400).json({
            message: 'Amount must be a number greater than zero.'
        });
    }

    if (type !== 'income' && type !== 'expense') {
        return res.status(400).json({
            message: 'Type must be income or expense.'
        });
    }

    const newTransaction = {
        id: transactions.length > 0
            ? Math.max(...transactions.map(transaction => transaction.id)) + 1
            : 1,
        description: description.trim(),
        amount,
        type,
        category
    };

    transactions.push(newTransaction);

    return res.status(201).json({
        message: 'Transaction created successfully!',
        transaction: newTransaction
    });
});

// Update a transaction
app.put('/api/transactions/:id', (req, res) => {
    const id = Number(req.params.id);
console.log('PUT request received:', req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: 'Transaction ID must be a positive integer.'
        });
    }

    const { description, amount, type, category } = req.body;

    if (typeof description !== 'string' || description.trim() === '') {
        return res.status(400).json({
            message: 'Description is required.'
        });
    }

    if (
        typeof amount !== 'number' ||
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        return res.status(400).json({
            message: 'Amount must be a number greater than zero.'
        });
    }

    if (type !== 'income' && type !== 'expense') {
        return res.status(400).json({
            message: 'Type must be income or expense.'
        });
    }

    const transactionIndex = transactions.findIndex(
        transaction => transaction.id === id
    );

    if (transactionIndex === -1) {
        return res.status(404).json({
            message: 'Transaction not found.'
        });
    }

    transactions[transactionIndex] = {
        id,
        description: description.trim(),
        amount,
        type,
        category
    };

    return res.status(200).json({
        message: 'Transaction updated successfully!',
        transaction: transactions[transactionIndex]
    });
});

// Delete a transaction
app.delete('/api/transactions/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: 'Transaction ID must be a positive integer.'
        });
    }

    const transactionIndex = transactions.findIndex(
        transaction => transaction.id === id
    );

    if (transactionIndex === -1) {
        return res.status(404).json({
            message: 'Transaction not found.'
        });
    }

    const deletedTransaction = transactions.splice(
        transactionIndex, 1
    )[0];

    return res.status(200).json({
        message: 'Transaction deleted successfully!',
        transaction: deletedTransaction
    });
});

// Start the server AFTER all routes
app.listen(PORT, () => {
    console.log(`FinTrack API is running on http://localhost:${PORT}`);
});
