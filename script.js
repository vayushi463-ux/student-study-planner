let members = [];
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

function addMember() {
    const input = document.getElementById("memberName");
    const name = input.value.trim();

    if (name === "") {
        alert("Please enter a member name.");
        return;
    }

    if (members.includes(name)) {
        alert("This member is already added.");
        return;
    }

    members.push(name);
    input.value = "";

    displayMembers();
    updateMemberOptions();
}

function displayMembers() {
    const list = document.getElementById("memberList");

    list.innerHTML = members
        .map((member, index) =>
            `<li>${member}
                <button onclick="removeMember(${index})">Remove</button>
            </li>`
        )
        .join("");
}

function removeMember(index) {
    members.splice(index, 1);
    displayMembers();
    updateMemberOptions();
}

function createGroup() {
    const groupName = document.getElementById("groupName").value.trim();

    if (groupName === "") {
        alert("Please enter a group name.");
        return;
    }

    if (members.length < 2) {
        alert("Add at least 2 members.");
        return;
    }

    localStorage.setItem("groupName", groupName);
    localStorage.setItem("members", JSON.stringify(members));

    document.getElementById("groupMessage").textContent =
        `Group "${groupName}" created successfully!`;

    updateMemberOptions();
    showExpenses();
}

function updateMemberOptions() {
    const paidBy = document.getElementById("paidBy");
    const included = document.getElementById("includedMembers");

    paidBy.innerHTML = '<option value="">Who paid?</option>';

    members.forEach(member => {
        paidBy.innerHTML += `<option value="${member}">${member}</option>`;
    });

    included.innerHTML = members
        .map(member => `
            <label class="member-check">
                <input type="checkbox" value="${member}">
                ${member}
            </label>
        `)
        .join("");
}

function addExpense() {
    const amount = Number(document.getElementById("amount").value);
    const paidBy = document.getElementById("paidBy").value;

    const selected = Array.from(
        document.querySelectorAll("#includedMembers input:checked")
    ).map(input => input.value);

    if (amount <= 0 || isNaN(amount)) {
        alert("Enter a valid expense amount.");
        return;
    }

    if (paidBy === "") {
        alert("Select who paid.");
        return;
    }

    if (selected.length === 0) {
        alert("Select at least one member.");
        return;
    }

    expenses.push({
        amount: amount,
        paidBy: paidBy,
        members: selected
    });

    localStorage.setItem("expenses", JSON.stringify(expenses));

    document.getElementById("amount").value = "";
    document.getElementById("paidBy").value = "";

    document
        .querySelectorAll("#includedMembers input")
        .forEach(input => input.checked = false);

    document.getElementById("expenseMessage").textContent =
        "Expense added successfully!";

    showExpenses();
    calculateBalances();
}

function showExpenses() {
    const history = document.getElementById("expenseHistory");

    if (expenses.length === 0) {
        history.innerHTML = "<p>No expenses added yet.</p>";
        return;
    }

    history.innerHTML = expenses.map((expense, index) => `
        <div class="expense-item">
            <strong>Expense ${index + 1}</strong>
            <p>Amount: ₹${expense.amount}</p>
            <p>Paid by: ${expense.paidBy}</p>
            <p>Shared by: ${expense.members.join(", ")}</p>
        </div>
    `).join("");
}

function calculateBalances() {
    const balances = {};

    members.forEach(member => {
        balances[member] = 0;
    });

    expenses.forEach(expense => {
        const share = expense.amount / expense.members.length;

        balances[expense.paidBy] += expense.amount;

        expense.members.forEach(member => {
            balances[member] -= share;
        });
    });

    const balanceBox = document.getElementById("balances");

    balanceBox.innerHTML = Object.keys(balances).map(member => {
        const value = balances[member];

        return `
            <div class="balance-item">
                <strong>${member}</strong>:
                ${value >= 0
                    ? `should receive ₹${value.toFixed(2)}`
                    : `owes ₹${Math.abs(value).toFixed(2)}`
                }
            </div>
        `;
    }).join("");

    generateSettlements(balances);
}

function generateSettlements(balances) {
    const creditors = [];
    const debtors = [];

    Object.entries(balances).forEach(([person, amount]) => {
        if (amount > 0.01) {
            creditors.push({
                person: person,
                amount: amount
            });
        } else if (amount < -0.01) {
            debtors.push({
                person: person,
                amount: Math.abs(amount)
            });
        }
    });

    const settlements = [];

    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
        const payment = Math.min(
            debtors[i].amount,
            creditors[j].amount
        );

        settlements.push(
            `${debtors[i].person} pays ${creditors[j].person} ₹${payment.toFixed(2)}`
        );

        debtors[i].amount -= payment;
        creditors[j].amount -= payment;

        if (debtors[i].amount < 0.01) {
            i++;
        }

        if (creditors[j].amount < 0.01) {
            j++;
        }
    }

    const settlementBox = document.getElementById("settlements");

    if (settlements.length === 0) {
        settlementBox.innerHTML = "<p>Everyone is settled up!</p>";
    } else {
        settlementBox.innerHTML = settlements
            .map(item => `<div class="settlement-item">${item}</div>`)
            .join("");
    }
}

function loadSavedData() {
    const savedMembers = JSON.parse(localStorage.getItem("members"));

    if (savedMembers) {
        members = savedMembers;
    }

    const savedGroup = localStorage.getItem("groupName");

    if (savedGroup) {
        document.getElementById("groupName").value = savedGroup;
    }

    displayMembers();
    updateMemberOptions();
    showExpenses();

    if (members.length > 0 && expenses.length > 0) {
        calculateBalances();
    }
}

loadSavedData();s