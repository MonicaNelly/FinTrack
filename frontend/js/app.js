/* =================================
   FINTRACK - APP.JS
   ================================= */


/* =================================
   1. INCOME
   ================================= */

let totalIncome = 0;

const incomeForm = document.getElementById("incomeForm");
const incomeAmount = document.getElementById("incomeAmount");
const incomeDescription = document.getElementById("incomeDescription");

const totalIncomeDisplay =
    document.getElementById("totalIncome");

const currentBalanceDisplay =
    document.getElementById("currentBalance");


/* =================================
   2. EXPENSES
   ================================= */

let totalExpenses = 0;

const expenseForm = document.getElementById("expenseForm");
const expenseAmount = document.getElementById("expenseAmount");
const expenseDescription =
    document.getElementById("expenseDescription");

const expenseCategory =
    document.getElementById("expenseCategory");

const totalExpensesDisplay =
    document.getElementById("totalExpenses");

const transactionList =
    document.getElementById("transactionList");


/* =================================
   3. MONTHLY BUDGET
   ================================= */

let monthlyBudget = 0;

const budgetForm =
    document.getElementById("budgetForm");

const budgetAmount =
    document.getElementById("budgetAmount");

const monthlyBudgetDisplay =
    document.getElementById("monthlyBudget");

const budgetProgressText =
    document.getElementById("budgetProgressText");

const budgetProgressBar =
    document.getElementById("budgetProgressBar");


/* =================================
   4. LOAD SAVED BUDGET
   ================================= */

const savedBudget =
    localStorage.getItem("monthlyBudget");

if (savedBudget !== null) {

    monthlyBudget = Number(savedBudget);

    monthlyBudgetDisplay.textContent =
        "R" + monthlyBudget.toFixed(2);
}


/* =================================
   5. SAVINGS GOAL
   ================================= */

let savingsGoalName = "";
let savingsTarget = 0;

const savingsForm =
    document.getElementById("savingsForm");

const savingsGoalNameInput =
    document.getElementById("savingsGoalName");

const savingsTargetInput =
    document.getElementById("savingsTarget");

const amountSavedInput =
    document.getElementById("amountSaved");

const savingsGoalDisplay =
    document.getElementById("savingsGoalDisplay");

const savingsProgressBar =
    document.getElementById("savingsProgressBar");


/* =================================
   6. UPDATE BALANCE
   ================================= */

function updateBalance() {

    const balance =
        totalIncome - totalExpenses;

    currentBalanceDisplay.textContent =
        "R" + balance.toFixed(2);
}


/* =================================
   7. UPDATE BUDGET PROGRESS
   ================================= */

function updateBudgetProgress() {

    /* If there is no budget */

    if (monthlyBudget <= 0) {

        budgetProgressText.textContent =
            "No budget set yet.";

        budgetProgressBar.style.width =
            "0%";

        return;
    }


    /* Calculate percentage */

    const percentage =
        (totalExpenses / monthlyBudget) * 100;


    /* Check if budget has been exceeded */

    if (totalExpenses > monthlyBudget) {

        const amountOver =
            totalExpenses - monthlyBudget;

        budgetProgressText.textContent =
            "Budget exceeded by R" +
            amountOver.toFixed(2);

        budgetProgressText.classList.add(
            "budget-warning"
        );

    } else {

        budgetProgressText.textContent =
            percentage.toFixed(1) +
            "% of your budget used";

        budgetProgressText.classList.remove(
            "budget-warning"
        );
    }


    /* Keep progress bar at maximum 100% */

    budgetProgressBar.style.width =
        Math.min(percentage, 100) + "%";
}


/* =================================
   8. ADD INCOME
   ================================= */

incomeForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        /* Get amount from input */

        const amount =
            Number(incomeAmount.value);


        /* Check amount */

        if (amount <= 0) {

            alert(
                "Please enter an amount greater than 0."
            );

            return;
        }


        /* Get description */

        const description =
            incomeDescription.value;


        /* Get date */

        const date =
            new Date().toLocaleDateString();


        /* Add amount to income */

        totalIncome =
            totalIncome + amount;


        /* Display total income */

        totalIncomeDisplay.textContent =
            "R" + totalIncome.toFixed(2);


        /* Update balance */

        updateBalance();


        /* Add transaction to the page */

        transactionList.innerHTML += `

            <div
                class="transaction-item"
                data-type="income"
                data-amount="${amount}"
            >

                <div>

                    <strong>Income</strong>

                    <p>${description}</p>

                    <small>${date}</small>

                </div>

                <span>
                    R${amount.toFixed(2)}
                </span>

                <button class="delete-button">
                    Delete
                </button>

            </div>

        `;


        /* Update budget */

        updateBudgetProgress();


        /* Clear the form */

        incomeAmount.value = "";

        incomeDescription.value = "";
    }
);


/* =================================
   9. ADD EXPENSE
   ================================= */

expenseForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        /* Get amount */

        const amount =
            Number(expenseAmount.value);


        /* Validate amount */

        if (amount <= 0) {

            alert(
                "Please enter an amount greater than 0."
            );

            return;
        }


        /* Get description */

        const description =
            expenseDescription.value;


        /* Get category */

        const category =
            expenseCategory.value;


        /* Get date */

        const date =
            new Date().toLocaleDateString();


        /* Add amount to expenses */

        totalExpenses =
            totalExpenses + amount;


        /* Display total expenses */

        totalExpensesDisplay.textContent =
            "R" + totalExpenses.toFixed(2);


        /* Update balance */

        updateBalance();


        /* Add transaction */

        transactionList.innerHTML += `

            <div
                class="transaction-item"
                data-type="expense"
                data-amount="${amount}"
            >

                <div>

                    <strong>${category}</strong>

                    <p>${description}</p>

                    <small>${date}</small>

                </div>

                <span>
                    R${amount.toFixed(2)}
                </span>

                <button class="delete-button">
                    Delete
                </button>

            </div>

        `;


        /* Update budget */

        updateBudgetProgress();


        /* Clear form */

        expenseAmount.value = "";

        expenseDescription.value = "";

        expenseCategory.value = "";
    }
);


/* =================================
   10. DELETE TRANSACTIONS
   ================================= */

transactionList.addEventListener(
    "click",
    function(event) {

        /* Check whether Delete was clicked */

        if (
            event.target.classList.contains(
                "delete-button"
            )
        ) {

            const transaction =
                event.target.parentElement;


            /* Get transaction type */

            const type =
                transaction.dataset.type;


            /* Get transaction amount */

            const amount =
                Number(transaction.dataset.amount);


            /* If income */

            if (type === "income") {

                totalIncome =
                    totalIncome - amount;

                totalIncomeDisplay.textContent =
                    "R" + totalIncome.toFixed(2);
            }


            /* If expense */

            if (type === "expense") {

                totalExpenses =
                    totalExpenses - amount;

                totalExpensesDisplay.textContent =
                    "R" + totalExpenses.toFixed(2);
            }


            /* Update balance */

            updateBalance();


            /* Update budget */

            updateBudgetProgress();


            /* Remove transaction */

            transaction.remove();
        }
    }
);


/* =================================
   11. SET MONTHLY BUDGET
   ================================= */

budgetForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        /* Get budget amount */

        const amount =
            Number(budgetAmount.value);


        /* Validate budget */

        if (amount <= 0) {

            alert(
                "Please enter a budget greater than 0."
            );

            return;
        }


        /* Store budget */

        monthlyBudget =
            amount;


        /* Save budget to browser */

        localStorage.setItem(
            "monthlyBudget",
            monthlyBudget
        );


        /* Display budget */

        monthlyBudgetDisplay.textContent =
            "R" + monthlyBudget.toFixed(2);


        /* Update progress */

        updateBudgetProgress();


        /* Clear input */

        budgetAmount.value = "";
    }
);


/* =================================
   12. SET SAVINGS GOAL
   ================================= */

savingsForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        /* Get values */

        const name =
            savingsGoalNameInput.value;

        const target =
            Number(savingsTargetInput.value);

        const amountSaved =
            Number(amountSavedInput.value);


        /* Validate target */

        if (target <= 0) {

            alert(
                "Please enter a savings target greater than 0."
            );

            return;
        }


        /* Validate saved amount */

        if (amountSaved < 0) {

            alert(
                "Amount saved cannot be negative."
            );

            return;
        }


        /* Make sure saved amount
           does not exceed target */

        if (amountSaved > target) {

            alert(
                "Amount saved cannot be greater than your savings target."
            );

            return;
        }


        /* Store savings information */

        savingsGoalName =
            name;

        savingsTarget =
            target;


        /* Calculate percentage */

        const savingsPercentage =
            (amountSaved / savingsTarget) * 100;


        /* Calculate remaining amount */

        const remainingAmount =
            savingsTarget - amountSaved;


        /* Update progress bar */

        savingsProgressBar.style.width =
            Math.min(
                savingsPercentage,
                100
            ) + "%";


        /* Check whether goal is reached */

        let savingsStatus = "";

        if (amountSaved === savingsTarget) {

            savingsStatus =
                "🎉 Savings goal reached!";
        }


        /* Display savings information */

        savingsGoalDisplay.innerHTML = `

            <h3>${savingsGoalName}</h3>

            <p>
                Target:
                R${savingsTarget.toFixed(2)}
            </p>

            <p>
                Amount Saved:
                R${amountSaved.toFixed(2)}
            </p>

            <p>
                Remaining:
                R${remainingAmount.toFixed(2)}
            </p>

            <p>
                Progress:
                ${savingsPercentage.toFixed(1)}%
            </p>

            <p>
                ${savingsStatus}
            </p>

        `;


        /* Clear form */

        savingsGoalNameInput.value = "";

        savingsTargetInput.value = "";

        amountSavedInput.value = "";
    }
);


/* =================================
   FINTRACK JAVASCRIPT LOADED
   ================================= */

console.log("FinTrack JavaScript is working!");