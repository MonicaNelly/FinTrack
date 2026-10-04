/* =================================
   FINTRACK - APP.JS
   ================================= */

"use strict";


/* =================================
   1. APP DATA (the single source of truth)
   ================================= */

/*
   Everything the app knows lives in this one object.
   Every transaction is an object in the array, for example:

   { id: "k3j2h1", type: "expense", description: "Groceries",
     amount: 250, category: "Food", date: "2026-10-04",
     createdAt: 1730000000000 }

   "date" is the day the money was spent or received.
   "createdAt" is when you typed it into the app.
   The screen is always drawn FROM this data.
*/

const STORAGE_KEY = "fintrack-data-v1";

const EXPENSE_CATEGORIES = [
    "Food", "Transport", "Rent", "Utilities", "Entertainment", "Other"
];

const INCOME_SOURCES = [
    "Salary", "Freelance", "Business", "Allowance", "Other"
];

const CATEGORY_COLORS = {
    Food: "#d79a1e",
    Transport: "#3b7ea1",
    Rent: "#7a5c99",
    Utilities: "#1b7f55",
    Entertainment: "#c8412f",
    Other: "#8a9a90"
};

const state = {
    transactions: [],
    budget: 0,
    savings: null,       // { name, target, saved } or null
    theme: "light",
    month: "all"         // "all" or "YYYY-MM"
};

/* These only affect what is shown, so they are not saved */

let currentFilter = "all";
let currentCategory = "all";
let currentSort = "newest";
let searchTerm = "";
let editingId = null;
let expenseChart = null;


/* =================================
   2. PAGE ELEMENTS
   ================================= */

function $(id) {
    return document.getElementById(id);
}

/* Top bar */
const monthSelect = $("monthSelect");

/* Summary cards */
const totalIncomeDisplay = $("totalIncome");
const totalExpensesDisplay = $("totalExpenses");
const currentBalanceDisplay = $("currentBalance");
const monthlyBudgetDisplay = $("monthlyBudget");

/* Forms */
const incomeForm = $("incomeForm");
const incomeDescription = $("incomeDescription");
const incomeSource = $("incomeSource");
const incomeAmount = $("incomeAmount");
const incomeDate = $("incomeDate");

const expenseForm = $("expenseForm");
const expenseDescription = $("expenseDescription");
const expenseAmount = $("expenseAmount");
const expenseCategory = $("expenseCategory");
const expenseDate = $("expenseDate");

const budgetForm = $("budgetForm");
const budgetAmount = $("budgetAmount");
const budgetProgressText = $("budgetProgressText");
const budgetProgressBar = $("budgetProgressBar");

const savingsForm = $("savingsForm");
const savingsGoalNameInput = $("savingsGoalName");
const savingsTargetInput = $("savingsTarget");
const amountSavedInput = $("amountSaved");
const savingsGoalDisplay = $("savingsGoalDisplay");
const savingsProgressBar = $("savingsProgressBar");

/* Transactions list and tools */
const transactionList = $("transactionList");
const filterBar = $("filterBar");
const searchInput = $("searchInput");
const categoryFilter = $("categoryFilter");
const sortSelect = $("sortSelect");

/* Reports */
const reportPeriod = $("reportPeriod");
const reportIncome = $("reportIncome");
const reportExpenses = $("reportExpenses");
const reportBalance = $("reportBalance");
const expenseBreakdown = $("expenseBreakdown");
const chartWrap = $("chartWrap");

/* Edit dialog */
const editDialog = $("editDialog");
const editForm = $("editForm");
const editDescription = $("editDescription");
const editCategory = $("editCategory");
const editCategoryLabel = $("editCategoryLabel");
const editAmount = $("editAmount");
const editDate = $("editDate");
const editCancel = $("editCancel");

/* Settings */
const themeToggle = $("themeToggle");
const clearDataButton = $("clearData");
const toast = $("toast");


/* =================================
   3. DATE HELPERS
   ================================= */

/* Today as "YYYY-MM-DD" (the format date inputs use) */

function todayString() {

    const d = new Date();

    return d.getFullYear() + "-" +
        String(d.getMonth() + 1).padStart(2, "0") + "-" +
        String(d.getDate()).padStart(2, "0");
}

/* "2026-10-04" becomes "2026-10" */

function monthKey(dateString) {
    return dateString.slice(0, 7);
}

/* Builds a date from "YYYY-MM-DD" without time zone surprises */

function parseDate(dateString) {

    const parts = dateString.split("-");

    return new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
    );
}

function formatDate(dateString) {

    return parseDate(dateString).toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

/* "2026-10" becomes "October 2026" */

function monthLabel(key) {

    return parseDate(key + "-01").toLocaleDateString("en-ZA", {
        month: "long",
        year: "numeric"
    });
}

function isValidDateString(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
}


/* =================================
   4. SAVE AND LOAD (localStorage)
   ================================= */

function saveState() {

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.warn("Could not save data:", error);
    }
}

function loadState() {

    state.month = todayString().slice(0, 7);

    try {

        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) {
            return;
        }

        const saved = JSON.parse(raw);

        const list = Array.isArray(saved.transactions)
            ? saved.transactions
            : [];

        /*
           Older versions of the app did not store a "date"
           or an income source, so we fill those in here.
        */

        state.transactions = list.map(function(t) {

            const created = t.createdAt || Date.now();

            const date = isValidDateString(t.date || "")
                ? t.date
                : todayStringFrom(created);

            let category = t.category;

            if (t.type === "income" &&
                INCOME_SOURCES.indexOf(category) === -1) {
                category = "Other";
            }

            return {
                id: t.id,
                type: t.type,
                description: t.description,
                amount: Number(t.amount) || 0,
                category: category,
                date: date,
                createdAt: created
            };
        });

        state.budget = Number(saved.budget) || 0;
        state.savings = saved.savings || null;
        state.theme = saved.theme === "dark" ? "dark" : "light";

        if (saved.month === "all" || /^\d{4}-\d{2}$/.test(saved.month || "")) {
            state.month = saved.month;
        }

    } catch (error) {
        console.warn("Could not load saved data:", error);
    }
}

function todayStringFrom(timestamp) {

    const d = new Date(timestamp);

    return d.getFullYear() + "-" +
        String(d.getMonth() + 1).padStart(2, "0") + "-" +
        String(d.getDate()).padStart(2, "0");
}


/* =================================
   5. HELPER FUNCTIONS
   ================================= */

/* Letters, numbers, spaces and a few normal symbols */

function isValidText(text) {
    return /^[A-Za-z0-9 .,'&()\/-]+$/.test(text);
}

/* Stops text from being treated as HTML */

function escapeHtml(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

/* Shows money the South African way, e.g. R 1 250,50 */

function formatMoney(amount) {

    return amount.toLocaleString("en-ZA", {
        style: "currency",
        currency: "ZAR"
    });
}

function roundMoney(amount) {
    return Math.round(amount * 100) / 100;
}

function makeId() {

    return Date.now().toString(36) +
        Math.random().toString(36).slice(2, 6);
}

function fillSelect(select, values) {

    select.innerHTML = values.map(function(v) {
        return '<option value="' + escapeHtml(v) + '">' +
            escapeHtml(v) + "</option>";
    }).join("");
}

/* Small message at the bottom right instead of alert() */

let toastTimer = null;

function showToast(message, type) {

    toast.textContent = message;

    toast.className = "toast show" +
        (type === "error" ? " error" : "");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(function() {
        toast.classList.remove("show");
    }, 3500);
}

/* Only the transactions inside the month chosen at the top */

function getPeriodTransactions() {

    if (state.month === "all") {
        return state.transactions;
    }

    return state.transactions.filter(function(t) {
        return monthKey(t.date) === state.month;
    });
}

/* Adds up a list of transactions */

function getTotals(list) {

    let income = 0;
    let expenses = 0;
    const categories = {};

    list.forEach(function(t) {

        if (t.type === "income") {
            income += t.amount;
        } else {
            expenses += t.amount;

            categories[t.category] =
                (categories[t.category] || 0) + t.amount;
        }
    });

    return {
        income: roundMoney(income),
        expenses: roundMoney(expenses),
        balance: roundMoney(income - expenses),
        categories: categories
    };
}

function periodName() {

    return state.month === "all"
        ? "all time"
        : monthLabel(state.month);
}

/*
   If you add or edit a transaction in a month you are not
   looking at, jump to that month so it does not "disappear".
*/

function followDate(date) {

    if (state.month !== "all" && monthKey(date) !== state.month) {

        state.month = monthKey(date);
        return " Now showing " + monthLabel(state.month) + ".";
    }

    return "";
}

function resetDateFields() {

    const today = todayString();

    incomeDate.value = today;
    expenseDate.value = today;

    incomeDate.max = today;
    expenseDate.max = today;
    editDate.max = today;
}


/* =================================
   6. DRAW THE SCREEN
   ================================= */

function renderMonthSelect() {

    const months = {};

    state.transactions.forEach(function(t) {
        months[monthKey(t.date)] = true;
    });

    months[todayString().slice(0, 7)] = true;

    if (state.month !== "all") {
        months[state.month] = true;
    }

    const keys = Object.keys(months).sort().reverse();

    monthSelect.innerHTML =
        '<option value="all">All time</option>' +
        keys.map(function(key) {
            return '<option value="' + key + '">' +
                monthLabel(key) + "</option>";
        }).join("");

    monthSelect.value = state.month;
}


function renderSummary() {

    const totals = getTotals(getPeriodTransactions());

    totalIncomeDisplay.textContent = formatMoney(totals.income);
    totalExpensesDisplay.textContent = formatMoney(totals.expenses);
    currentBalanceDisplay.textContent = formatMoney(totals.balance);
    monthlyBudgetDisplay.textContent = formatMoney(state.budget);

    currentBalanceDisplay.classList.toggle(
        "negative",
        totals.balance < 0
    );

    reportPeriod.textContent = "Showing " + periodName() + ".";
    reportIncome.textContent = formatMoney(totals.income);
    reportExpenses.textContent = formatMoney(totals.expenses);
    reportBalance.textContent = formatMoney(totals.balance);
}


function renderBudget() {

    budgetProgressBar.classList.remove("warn", "over");
    budgetProgressText.classList.remove("budget-warning");

    /* No budget yet */

    if (state.budget <= 0) {

        budgetProgressText.textContent = "No budget set yet.";
        budgetProgressBar.style.width = "0%";
        return;
    }

    /* A monthly budget only makes sense for one month */

    if (state.month === "all") {

        budgetProgressText.textContent =
            "Choose a month at the top to see how much of your budget you have used.";

        budgetProgressBar.style.width = "0%";
        return;
    }

    const totals = getTotals(getPeriodTransactions());

    const percentage =
        (totals.expenses / state.budget) * 100;

    if (totals.expenses > state.budget) {

        const amountOver = totals.expenses - state.budget;

        budgetProgressText.textContent =
            "Budget exceeded by " + formatMoney(amountOver) +
            " in " + monthLabel(state.month);

        budgetProgressText.classList.add("budget-warning");
        budgetProgressBar.classList.add("over");

    } else {

        const left = state.budget - totals.expenses;

        budgetProgressText.textContent =
            percentage.toFixed(1) + "% of your budget used in " +
            monthLabel(state.month) + " (" +
            formatMoney(totals.expenses) + " of " +
            formatMoney(state.budget) + "). " +
            formatMoney(left) + " left.";

        if (percentage >= 70) {
            budgetProgressBar.classList.add("warn");
        }
    }

    budgetProgressBar.style.width =
        Math.min(percentage, 100) + "%";
}


function renderSavings() {

    const goal = state.savings;

    if (!goal) {

        savingsGoalDisplay.innerHTML =
            '<p>No savings goal yet. Set one above to track your progress.</p>';

        savingsProgressBar.style.width = "0%";
        return;
    }

    const percentage = (goal.saved / goal.target) * 100;
    const remaining = goal.target - goal.saved;

    const status = goal.saved >= goal.target
        ? '<p class="goal-reached">🎉 Savings goal reached!</p>'
        : "";

    savingsGoalDisplay.innerHTML = `
        <h3>${escapeHtml(goal.name)}</h3>
        <p>Target: ${formatMoney(goal.target)}</p>
        <p>Amount saved: ${formatMoney(goal.saved)}</p>
        <p>Remaining: ${formatMoney(remaining)}</p>
        <p>Progress: ${percentage.toFixed(1)}%</p>
        ${status}
        <button type="button" class="link-button" id="removeGoal">
            Remove goal
        </button>
    `;

    savingsProgressBar.style.width =
        Math.min(percentage, 100) + "%";
}


/* Category dropdown for the transaction list */

function renderCategoryFilter() {

    const names = [];

    EXPENSE_CATEGORIES.concat(INCOME_SOURCES).forEach(function(name) {
        if (names.indexOf(name) === -1) {
            names.push(name);
        }
    });

    categoryFilter.innerHTML =
        '<option value="all">All categories</option>' +
        names.map(function(name) {
            return '<option value="' + escapeHtml(name) + '">' +
                escapeHtml(name) + "</option>";
        }).join("");

    categoryFilter.value = currentCategory;
}


function renderTransactions() {

    const term = searchTerm.trim().toLowerCase();

    const items = getPeriodTransactions()
        .filter(function(t) {
            return currentFilter === "all" || t.type === currentFilter;
        })
        .filter(function(t) {
            return currentCategory === "all" || t.category === currentCategory;
        })
        .filter(function(t) {
            return term === "" ||
                t.description.toLowerCase().indexOf(term) !== -1 ||
                t.category.toLowerCase().indexOf(term) !== -1;
        })
        .slice()
        .sort(function(a, b) {

            if (currentSort === "highest") {
                return b.amount - a.amount;
            }

            if (currentSort === "lowest") {
                return a.amount - b.amount;
            }

            /* Dates are "YYYY-MM-DD", so text comparison works */

            const byDate = a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
            const order = byDate !== 0 ? byDate : a.createdAt - b.createdAt;

            return currentSort === "oldest" ? order : -order;
        });

    /* Empty states */

    if (items.length === 0) {

        let message;

        if (state.transactions.length === 0) {
            message = "No transactions yet. Add your first income or expense above.";
        } else if (getPeriodTransactions().length === 0) {
            message = "No transactions in " + periodName() +
                ". Pick another month or add one above.";
        } else {
            message = "Nothing matches your search or filters.";
        }

        transactionList.innerHTML =
            '<p class="empty">' + escapeHtml(message) + "</p>";

        return;
    }

    transactionList.innerHTML = items.map(function(t) {

        const isIncome = t.type === "income";
        const sign = isIncome ? "+" : "−";

        return `
            <div class="transaction-item" data-id="${t.id}">

                <div class="t-info">
                    <span class="badge ${t.type}">${escapeHtml(t.category)}</span>
                    <p>${escapeHtml(t.description)}</p>
                    <small>${formatDate(t.date)}</small>
                </div>

                <span class="t-amount ${t.type}">
                    ${sign}${formatMoney(t.amount)}
                </span>

                <div class="t-actions">
                    <button type="button" class="edit-button">Edit</button>
                    <button type="button" class="delete-button">Delete</button>
                </div>

            </div>
        `;

    }).join("");
}


function renderReports() {

    const totals = getTotals(getPeriodTransactions());
    const names = Object.keys(totals.categories);

    /* Nothing to show yet */

    if (names.length === 0) {

        expenseBreakdown.innerHTML =
            '<p class="empty">No expenses in ' + escapeHtml(periodName()) +
            ". Your spending breakdown will appear here.</p>";

        chartWrap.classList.add("hidden");

        if (expenseChart) {
            expenseChart.destroy();
            expenseChart = null;
        }

        return;
    }

    /* Biggest spending first */

    names.sort(function(a, b) {
        return totals.categories[b] - totals.categories[a];
    });

    /* List with bars */

    expenseBreakdown.innerHTML = names.map(function(name) {

        const amount = totals.categories[name];
        const percent = (amount / totals.expenses) * 100;
        const color = CATEGORY_COLORS[name] || CATEGORY_COLORS.Other;

        return `
            <div class="breakdown-row">
                <div class="breakdown-top">
                    <span>
                        <span class="dot" style="background:${color}"></span>
                        <strong>${escapeHtml(name)}</strong>
                    </span>
                    <span>${formatMoney(amount)} (${percent.toFixed(0)}%)</span>
                </div>
                <div class="breakdown-bar">
                    <div style="width:${percent}%; background:${color}"></div>
                </div>
            </div>
        `;

    }).join("");

    /* Doughnut chart (only if Chart.js loaded) */

    if (typeof Chart === "undefined") {
        chartWrap.classList.add("hidden");
        return;
    }

    chartWrap.classList.remove("hidden");

    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart($("expenseChart"), {
        type: "doughnut",
        data: {
            labels: names,
            datasets: [{
                data: names.map(function(n) {
                    return totals.categories[n];
                }),
                backgroundColor: names.map(function(n) {
                    return CATEGORY_COLORS[n] || CATEGORY_COLORS.Other;
                }),
                borderWidth: 0
            }]
        },
        options: {
            cutout: "62%",
            plugins: { legend: { display: false } }
        }
    });
}


function renderTheme() {

    document.documentElement.dataset.theme = state.theme;

    themeToggle.textContent = state.theme === "dark"
        ? "Switch to light mode"
        : "Switch to dark mode";
}


/* Redraws everything */

function render() {

    renderMonthSelect();
    renderSummary();
    renderBudget();
    renderSavings();
    renderCategoryFilter();
    renderTransactions();
    renderReports();
    renderTheme();
}

/* Save, then redraw */

function update() {

    saveState();
    render();
}


/* =================================
   7. ADD INCOME
   ================================= */

incomeForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const description = incomeDescription.value.trim();
    const amount = roundMoney(Number(incomeAmount.value));
    const date = incomeDate.value;

    if (!isValidText(description)) {
        showToast(
            "Use letters, numbers and spaces only in the description.",
            "error"
        );
        return;
    }

    if (amount <= 0) {
        showToast("Enter an amount greater than 0.", "error");
        return;
    }

    if (!isValidDateString(date) || date > todayString()) {
        showToast("Choose a date that is not in the future.", "error");
        return;
    }

    state.transactions.push({
        id: makeId(),
        type: "income",
        description: description,
        amount: amount,
        category: incomeSource.value,
        date: date,
        createdAt: Date.now()
    });

    const note = followDate(date);

    update();

    incomeForm.reset();
    resetDateFields();
    showToast("Income added." + note);
});


/* =================================
   8. ADD EXPENSE
   ================================= */

expenseForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const description = expenseDescription.value.trim();
    const amount = roundMoney(Number(expenseAmount.value));
    const category = expenseCategory.value;
    const date = expenseDate.value;

    if (!isValidText(description)) {
        showToast(
            "Use letters, numbers and spaces only in the description.",
            "error"
        );
        return;
    }

    if (amount <= 0) {
        showToast("Enter an amount greater than 0.", "error");
        return;
    }

    if (!category) {
        showToast("Choose an expense category.", "error");
        return;
    }

    if (!isValidDateString(date) || date > todayString()) {
        showToast("Choose a date that is not in the future.", "error");
        return;
    }

    state.transactions.push({
        id: makeId(),
        type: "expense",
        description: description,
        amount: amount,
        category: category,
        date: date,
        createdAt: Date.now()
    });

    const note = followDate(date);

    update();

    expenseForm.reset();
    resetDateFields();
    showToast("Expense added." + note);
});


/* =================================
   9. EDIT AND DELETE
   ================================= */

transactionList.addEventListener("click", function(event) {

    const item = event.target.closest(".transaction-item");

    if (!item) {
        return;
    }

    const id = item.dataset.id;

    /* Delete */

    if (event.target.classList.contains("delete-button")) {

        state.transactions = state.transactions.filter(function(t) {
            return t.id !== id;
        });

        update();
        showToast("Transaction deleted.");
        return;
    }

    /* Edit: fill the dialog with this transaction */

    if (event.target.classList.contains("edit-button")) {

        const t = state.transactions.find(function(x) {
            return x.id === id;
        });

        if (!t) {
            return;
        }

        editingId = id;

        const isIncome = t.type === "income";

        editCategoryLabel.textContent = isIncome ? "Income source" : "Category";
        fillSelect(editCategory, isIncome ? INCOME_SOURCES : EXPENSE_CATEGORIES);

        editDescription.value = t.description;
        editCategory.value = t.category;
        editAmount.value = t.amount;
        editDate.value = t.date;

        editDialog.showModal();
    }
});

editForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const t = state.transactions.find(function(x) {
        return x.id === editingId;
    });

    if (!t) {
        editDialog.close();
        return;
    }

    const description = editDescription.value.trim();
    const amount = roundMoney(Number(editAmount.value));
    const date = editDate.value;

    if (!isValidText(description)) {
        showToast(
            "Use letters, numbers and spaces only in the description.",
            "error"
        );
        return;
    }

    if (amount <= 0) {
        showToast("Enter an amount greater than 0.", "error");
        return;
    }

    if (!isValidDateString(date) || date > todayString()) {
        showToast("Choose a date that is not in the future.", "error");
        return;
    }

    t.description = description;
    t.category = editCategory.value;
    t.amount = amount;
    t.date = date;

    const note = followDate(date);

    editDialog.close();
    update();
    showToast("Transaction updated." + note);
});

editCancel.addEventListener("click", function() {
    editDialog.close();
});


/* =================================
   10. MONTH, FILTERS, SEARCH AND SORT
   ================================= */

monthSelect.addEventListener("change", function() {

    state.month = monthSelect.value;
    update();
});

filterBar.addEventListener("click", function(event) {

    const button = event.target.closest(".filter-button");

    if (!button) {
        return;
    }

    currentFilter = button.dataset.filter;

    filterBar.querySelectorAll(".filter-button").forEach(function(b) {
        b.classList.toggle("active", b === button);
    });

    renderTransactions();
});

searchInput.addEventListener("input", function() {

    searchTerm = searchInput.value;
    renderTransactions();
});

categoryFilter.addEventListener("change", function() {

    currentCategory = categoryFilter.value;
    renderTransactions();
});

sortSelect.addEventListener("change", function() {

    currentSort = sortSelect.value;
    renderTransactions();
});


/* =================================
   11. SET MONTHLY BUDGET
   ================================= */

budgetForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const amount = roundMoney(Number(budgetAmount.value));

    if (amount <= 0) {
        showToast("Enter a budget greater than 0.", "error");
        return;
    }

    state.budget = amount;

    update();

    budgetForm.reset();
    showToast("Budget set.");
});


/* =================================
   12. SET SAVINGS GOAL
   ================================= */

savingsForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const name = savingsGoalNameInput.value.trim();
    const target = roundMoney(Number(savingsTargetInput.value));
    const saved = roundMoney(Number(amountSavedInput.value));

    if (!isValidText(name)) {
        showToast(
            "Use letters, numbers and spaces only in the goal name.",
            "error"
        );
        return;
    }

    if (target <= 0) {
        showToast("Enter a savings target greater than 0.", "error");
        return;
    }

    if (saved < 0) {
        showToast("Amount saved cannot be negative.", "error");
        return;
    }

    if (saved > target) {
        showToast(
            "Amount saved cannot be more than your target.",
            "error"
        );
        return;
    }

    state.savings = {
        name: name,
        target: target,
        saved: saved
    };

    update();

    savingsForm.reset();
    showToast("Savings goal saved.");
});

/* "Remove goal" button is created inside the display area */

savingsGoalDisplay.addEventListener("click", function(event) {

    if (event.target.id === "removeGoal") {

        state.savings = null;

        update();
        showToast("Savings goal removed.");
    }
});


/* =================================
   13. SIDEBAR NAVIGATION
   ================================= */

const navLinks = document.querySelectorAll("#sideNav a");

function setActiveLink(id) {

    navLinks.forEach(function(link) {
        link.classList.toggle(
            "active",
            link.getAttribute("href") === "#" + id
        );
    });
}

navLinks.forEach(function(link) {

    link.addEventListener("click", function() {
        setActiveLink(link.getAttribute("href").slice(1));
    });
});

if ("IntersectionObserver" in window) {

    const observer = new IntersectionObserver(
        function(entries) {

            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    setActiveLink(entry.target.id);
                }
            });
        },
        { rootMargin: "-30% 0px -60% 0px" }
    );

    navLinks.forEach(function(link) {

        const target = document.querySelector(
            link.getAttribute("href")
        );

        if (target) {
            observer.observe(target);
        }
    });
}


/* =================================
   14. SETTINGS
   ================================= */

themeToggle.addEventListener("click", function() {

    state.theme = state.theme === "dark" ? "light" : "dark";

    update();
});

clearDataButton.addEventListener("click", function() {

    const sure = confirm(
        "Delete all transactions, your budget and your savings goal? This cannot be undone."
    );

    if (!sure) {
        return;
    }

    state.transactions = [];
    state.budget = 0;
    state.savings = null;

    update();
    showToast("All data cleared.");
});


/* =================================
   15. START THE APP
   ================================= */

loadState();
resetDateFields();
render();

console.log("FinTrack JavaScript is working!");