
const express = require('express');

const app = express();

const PORT = 3000;

// Allow the API to receive JSON data
app.use(express.json());

// Home endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the FinTrack API!',
        status: 'success'
    });
});

app.get('/api/transactions', (req, res) => {
    const transactions = [
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

    res.json(transactions);
});

// Start the server
app.listen(PORT, () => {
    console.log(`FinTrack API is running on http://localhost:${PORT}`);
});
