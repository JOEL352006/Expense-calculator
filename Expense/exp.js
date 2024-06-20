document.addEventListener('DOMContentLoaded', () => {
    const expenseForm = document.getElementById('expense-form');
    const expenseList = document.getElementById('expense-list');
    const expenseTableBody = document.getElementById('expense-table-body');
    const totalAmountSpan = document.getElementById('total-amount');
    const filterCategorySelect = document.getElementById('filter-category');
    const filterDateStartInput = document.getElementById('filter-date-start');
    const filterDateEndInput = document.getElementById('filter-date-end');
    const filterButton = document.getElementById('filter-button');
    const expenseChartCtx = document.getElementById('expense-chart').getContext('2d');

    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    let chart;

    // Function to render expenses
    function renderExpenses(filteredExpenses = expenses) {
        expenseList.innerHTML = ''; // Clear the UL list
        expenseTableBody.innerHTML = ''; // Clear the table body

        let totalAmount = 0;
        filteredExpenses.forEach((expense, index) => {
            // Render in the list
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${expense.name} - ₹${expense.amount.toFixed(2)} - ${expense.category} - ${expense.date}</span>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            `;
            expenseList.appendChild(li);

            // Render in the table
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${expense.name}</td>
                <td>${expense.category}</td>
                <td>${expense.date}</td>
                <td>
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </td>
            `;
            expenseTableBody.appendChild(tr);

            totalAmount += expense.amount;

            li.querySelector('.edit-btn').addEventListener('click', () => {
                editExpense(expense);
            });

            li.querySelector('.delete-btn').addEventListener('click', () => {
                deleteExpense(expense);
            });

            tr.querySelector('.edit-btn').addEventListener('click', () => {
                editExpense(expense);
            });

            tr.querySelector('.delete-btn').addEventListener('click', () => {
                deleteExpense(expense);
            });
        });

        totalAmountSpan.textContent = totalAmount.toFixed(2);
        updateExpenseChart(filteredExpenses);
    }

    // Function to add expense
    function addExpense(expense) {
        expenses.push(expense);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        renderExpenses();
    }

    // Function to edit expense
    function editExpense(expenseToEdit) {
        document.getElementById('expense-name').value = expenseToEdit.name;
        document.getElementById('expense-amount').value = expenseToEdit.amount;
        document.getElementById('expense-category').value = expenseToEdit.category;
        document.getElementById('expense-date').value = expenseToEdit.date;
        deleteExpense(expenseToEdit);
    }

    // Function to delete expense
    function deleteExpense(expenseToDelete) {
        expenses = expenses.filter(expense => expense !== expenseToDelete);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        renderExpenses();
    }

    // Function to filter expenses
    function filterExpenses() {
        const category = filterCategorySelect.value;
        const startDate = filterDateStartInput.value;
        const endDate = filterDateEndInput.value;

        const filteredExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            const isCategoryMatch = category === 'all' || expense.category === category;
            const isDateMatch = (!startDate || expenseDate >= new Date(startDate)) &&
                                (!endDate || expenseDate <= new Date(endDate));
            return isCategoryMatch && isDateMatch;
        });

        renderExpenses(filteredExpenses);
    }

    // Function to update the expense chart
    function updateExpenseChart(filteredExpenses = expenses) {
        const categories = ['Food', 'Transport', 'Entertainment', 'Bills', 'Others'];
        const categoryTotals = categories.map(category => {
            return filteredExpenses
                .filter(expense => expense.category === category)
                .reduce((sum, expense) => sum + expense.amount, 0);
        });

        if (chart) {
            chart.destroy();
        }

        chart = new Chart(expenseChartCtx, {
            type: 'pie',
            data: {
                labels: categories,
                datasets: [{
                    label: 'Expenses',
                    data: categoryTotals,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Expense Distribution by Category'
                    }
                }
            }
        });
    }

    // Event listener for form submission
    expenseForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('expense-name').value;
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const category = document.getElementById('expense-category').value;
        const date = document.getElementById('expense-date').value;

        if (name && amount && category && date) {
            const expense = { name, amount, category, date };
            addExpense(expense);
            expenseForm.reset();
        }
    });

    // Event listener for filter button
    filterButton.addEventListener('click', filterExpenses);

    // Initial render
    renderExpenses();
});
