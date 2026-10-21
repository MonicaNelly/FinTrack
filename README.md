# FinTrack – Personal Finance & Budget Management System

## 1. Project Overview

FinTrack is a personal finance management web application designed to help users track their income and expenses, manage budgets, set savings goals, and understand their spending habits.

The application provides a simple dashboard where users can view their financial summaries, manage transactions, and review an expense breakdown by category.

This project is being developed to strengthen my skills in software development, frontend development, backend API development, database management, and application design.

## 2. Problem Statement

Managing personal finances can be challenging when income, expenses, budgets, and savings goals are not organised in one place.

FinTrack aims to address this problem by providing a centralised application that helps users record financial transactions, monitor their balance, track spending, and manage their budgets and savings goals.

## 3. Project Objectives

The main objectives of FinTrack are to:

- Record and manage income and expenses.
- Categorise expenses to make spending easier to understand.
- Calculate total income, total expenses, and the current balance.
- Create and monitor a monthly budget.
- Set savings goals and track progress towards them.
- Display recent transactions and filter them by type.
- Generate a financial summary and expense breakdown.
- Provide light and dark theme options.
- Store application data locally in the browser in the current version.
- Develop a backend API and database integration as the project progresses.

## 4. Features

### Dashboard
- Displays total income, total expenses, current balance, and monthly budget.
- Provides an overview of the user's financial activity.

### Income Management
- Add income transactions.
- Validate income descriptions and amounts.
- Update financial totals automatically.

### Expense Management
- Add expenses with descriptions, amounts, and categories.
- Categorise spending, including food, transport, rent, utilities, entertainment, and other expenses.
- Update totals and reports when expenses are added or deleted.

### Budget Management
- Set a budget.
- View budget progress.

### Savings Goals
- Create a savings goal.
- Enter a target amount and the amount already saved.
- View savings progress.

### Transaction Management
- View recent transactions.
- Filter transactions by income or expense.
- Delete transactions.

### Financial Reports
- View total income, total expenses, and current balance.
- View an expense breakdown by category.
- Display expense categories using a doughnut chart.

### Settings
- Switch between light and dark themes.
- Clear locally stored application data.

## 5. Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Structures the application interface. |
| CSS3 | Styles the interface and supports responsive layouts and themes. |
| JavaScript | Implements application logic, calculations, validation, and user interactions. |
| Chart.js | Displays the expense breakdown as a chart. |
| Browser Local Storage | Saves application data locally in the current version. |
| Node.js | Planned backend runtime. |
| Express.js | Planned framework for building the backend API. |
| PostgreSQL | Planned relational database. |
| Postman | Will be used to test API endpoints during backend development. |
| Git and GitHub | Version control and project hosting. |

**Note:** Node.js, Express.js, PostgreSQL, and Postman-based API testing are part of the planned backend development. They should not be considered completed integrations until implemented and tested.

## 6. Project Structure

```text
FINTRACK/
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── backend/
├── database/
├── documentation/
└── README.md
```

The frontend contains the user interface, styling, and JavaScript application logic. The backend directory is intended for the Node.js and Express API, while the database directory will contain database-related resources. The documentation directory will contain project documentation.

Additional backend and database files will be added as development progresses.

## 7. How the Current Application Works

The current version uses JavaScript to manage application data and update the interface.

- Financial transactions are stored in the application's state.
- Income, expenses, balance, and expense categories are calculated from the transactions.
- The interface and financial reports are refreshed when data changes.
- Local Storage allows data to persist in the same browser between visits.
- Chart.js visualises the expense breakdown.

The current Local Storage implementation is intended for this version of the project. It is not a shared database, and data is not automatically synchronised between different browsers or devices.

## 8. Planned Backend Architecture

The next development phase will introduce a backend API using Node.js and Express.js.

The planned architecture is:

```text
User
  |
  v
HTML, CSS and JavaScript Frontend
  |
  v
Node.js and Express.js REST API
  |
  v
PostgreSQL Database
```

The frontend will communicate with the backend through HTTP requests. The API will handle financial records and communicate with PostgreSQL to store and retrieve data.

Planned API functionality includes:

- Creating income and expense records.
- Retrieving transactions.
- Updating or deleting records.
- Managing budgets and savings goals.
- Retrieving financial summaries and reports.

These features will be implemented and tested during the backend development phase.

## 9. Installation and Setup

### Current Frontend Version

1. Clone or download the repository.
2. Open the project folder in Visual Studio Code.
3. Open `frontend/index.html` in a browser, or use a local development server such as the VS Code Live Server extension.
4. Use the application to add income, record expenses, manage budgets, set savings goals, and view financial reports.

The current frontend does not require the planned Express backend or PostgreSQL database to run.

### Future Backend Setup

Once the backend has been implemented, the setup instructions will be updated to include the required Node.js version, dependency installation, environment variables, database configuration, and server startup commands.

## 10. Validation and Data Handling

The current application validates important user inputs, including transaction descriptions and positive financial amounts.

Application data is stored in browser Local Storage. Clearing the application data is irreversible through the application's current clear-data feature, so users should ensure they no longer need the stored information before using it.

Database persistence, server-side validation, authentication, and authorisation will be addressed as the backend develops.

## 11. Future Improvements

Planned improvements include:

- Building a REST API with Node.js and Express.js.
- Integrating a PostgreSQL database.
- Connecting the existing frontend to the backend API.
- Implementing user registration and login.
- Adding secure authentication and authorisation.
- Supporting separate financial records for different users.
- Improving financial reports and analytics.
- Adding automated tests and API documentation.
- Deploying the application so it can be accessed online.

## 12. Learning Outcomes

Through this project, I aim to develop practical experience in:

- Frontend development with HTML, CSS, and JavaScript.
- JavaScript state management and data validation.
- REST API design and HTTP methods.
- Backend development with Node.js and Express.js.
- Relational database design and SQL.
- API testing with Postman.
- Version control using Git and GitHub.
- Building and documenting a full-stack application.

## 13. Project Status

**Current stage:** Frontend MVP implemented.

The current application includes income and expense management, financial summaries, budgets, savings goals, transaction filtering and deletion, expense reports, chart visualisation, theme switching, and browser-based data persistence.

**Next stage:** Develop the Node.js and Express.js backend, integrate PostgreSQL, and connect the frontend to the API.

## 14. Author

**Monica Ndlovu**

BSc in Information Technology student | Software Development

GitHub: [MonicaNelly](https://github.com/MonicaNelly)

---

*FinTrack is a learning and portfolio project developed to demonstrate practical software development skills and full-stack application design.*
