// Elements
const registerSection = document.getElementById("registerSection");
const loginSection = document.getElementById("loginSection");
const appSection = document.getElementById("appSection");

const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");

const usernameInput = document.getElementById("username");
const regUsernameInput = document.getElementById("regUsername");
const regPasswordInput = document.getElementById("regPassword");

const openModalBtn = document.getElementById("openModal");
const modal = document.getElementById("budgetModal");
const closeModalBtn = document.getElementById("closeModal");

const incomeInput = document.getElementById("income");
const calculateBtn = document.getElementById("calculate");

const outgoingsTable = document.getElementById("outgoingsTable");
const remainingOutgoingsEl = document.getElementById("remainingOutgoings");
const disposableEl = document.getElementById("disposableIncome");
const paidOutgoingsEl = document.getElementById("paidOutgoings");

const addOutgoingBtn = document.getElementById("addOutgoing");

const warningModal = document.getElementById("warningModal");
const warningModalText = document.getElementById("warningModalText");
const closeWarningModalBtn = document.getElementById("closeWarningModal");

let currentUser = null;

// Default outgoings hardcoded
const defaultOutgoings = [
  { name: "CHILDCARE", amount: 150, date: 1 },
  { name: "CRED", amount: 240, date: 1 },
  { name: "KEEP", amount: 300, date: 1 },
  { name: "LOTTOS", amount: 200, date: 1 },
  { name: "VEHICLE TAX", amount: 60, date: 1 },
  { name: "CAR INS", amount: 59, date: 1 },
  { name: "CAPITAL ONE", amount: 17.8, date: 2 },
  { name: "CAPITAL ONE", amount: 15.35, date: 2 },
  { name: "ISA", amount: 200, date: 2 },
  { name: "CREATION", amount: 28.29, date: 3 },
  { name: "VOXI", amount: 10, date: 3 },
  { name: "YOU FIBRE", amount: 29.99, date: 3 },
  { name: "B/CARD", amount: 200, date: 6 },
  { name: "VAN INS", amount: 49, date: 7 },
  { name: "NETFLIX", amount: 12.99, date: 9 },
  { name: "OVERDRAFT FEE", amount: 49, date: 18 },
  { name: "EXPERIAN", amount: 14.99, date: 19 },
  { name: "PHONE", amount: 10, date: 23 },
  { name: "DIESEL", amount: 150, date: 27 },
  { name: "FEE", amount: 5, date: 27 },
  { name: "Rent", amount: 100, date: 1 },
];

let outgoings = [];

// -------------------------
// USER AUTH SIMPLIFIED
// -------------------------

registerBtn.onclick = () => {
  const regUsername = regUsernameInput.value.trim();
  const regPassword = regPasswordInput.value.trim();

  if (!regUsername || !regPassword) {
    alert("Please enter username and password to register.");
    return;
  }

  if (localStorage.getItem(`user_${regUsername}`)) {
    alert("Username already exists, please choose another.");
    return;
  }

  localStorage.setItem(`user_${regUsername}`, regPassword);
  alert("Registered! Please log in.");
  regUsernameInput.value = "";
  regPasswordInput.value = "";
};

loginBtn.onclick = () => {
  const username = usernameInput.value.trim();
  if (!username) {
    alert("Please enter your username.");
    return;
  }

  const storedPassword = localStorage.getItem(`user_${username}`);
  if (!storedPassword) {
    alert("User not found. Please register.");
    return;
  }

  currentUser = username;
  registerSection.style.display = "none";
  loginSection.style.display = "none";
  appSection.style.display = "block";

  loadOutgoings();
  renderOutgoings();
  calculateRemaining();
};

// -------------------------
// OUTGOINGS MANAGEMENT
// -------------------------

function loadOutgoings() {
  const saved = localStorage.getItem(`outgoings_${currentUser}`);
  if (saved) {
    outgoings = JSON.parse(saved);
  } else {
    outgoings = defaultOutgoings.slice();
    saveOutgoings();
  }
}

function saveOutgoings() {
  localStorage.setItem(`outgoings_${currentUser}`, JSON.stringify(outgoings));
}

function renderOutgoings() {
  outgoingsTable.innerHTML = "";
  const today = new Date().getDate();
  outgoings.sort((a, b) => a.date - b.date);

  outgoings.forEach((item, index) => {
    const paid = today >= item.date;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><input value="${item.name}" onchange="updateOutgoing(${index}, 'name', this.value)" /></td>
      <td><input type="number" value="${item.amount.toFixed(2)}" onchange="updateOutgoing(${index}, 'amount', parseFloat(this.value))" /></td>
      <td><input type="number" value="${item.date}" onchange="updateOutgoing(${index}, 'date', parseInt(this.value))" min="1" max="31" /></td>
      <td class="${paid ? "paid" : "not-paid"}">${paid ? "Paid" : "Not Paid"}</td>
      <td><button onclick="deleteOutgoing(${index})">&#10006;</button></td>
    `;
    outgoingsTable.appendChild(row);
  });
}

function updateOutgoing(index, field, value) {
  if (field === "amount" || field === "date") {
    if (isNaN(value) || value === "") return;
  }
  outgoings[index][field] = value;
  saveOutgoings();
  calculateRemaining();
  renderOutgoings();
}

function deleteOutgoing(index) {
  outgoings.splice(index, 1);
  saveOutgoings();
  renderOutgoings();
  calculateRemaining();
}

// -------------------------
// CALCULATIONS
// -------------------------

function calculateRemaining() {
  const incomeVal = parseFloat(incomeInput.value);
  if (isNaN(incomeVal) || incomeVal <= 0) {
    disposableEl.textContent = "0.00";
    remainingOutgoingsEl.textContent = "0.00";
    paidOutgoingsEl.textContent = "0.00";
    warningModal.style.display = "none";
    return;
  }

  const today = new Date().getDate();

  // Sum unpaid outgoings (date in future)
  const totalUnpaid = outgoings.reduce(
    (sum, o) => (today < o.date ? sum + o.amount : sum),
    0
  );

  // Sum paid outgoings (date reached or past)
  const totalPaid = outgoings.reduce(
    (sum, o) => (today >= o.date ? sum + o.amount : sum),
    0
  );

  // Disposable income = income - all outgoings (paid + unpaid)
  const disposableIncome = incomeVal - totalPaid - totalUnpaid;

  disposableEl.textContent = disposableIncome > 0 ? disposableIncome.toFixed(2) : "0.00";
  remainingOutgoingsEl.textContent = totalUnpaid.toFixed(2);
  paidOutgoingsEl.textContent = totalPaid.toFixed(2);

  if (disposableIncome <= 200) {
    const displayVal = disposableIncome < 0 ? 0 : disposableIncome.toFixed(2);
    warningModalText.textContent = `Disposable income remaining is £${displayVal}`;
    warningModal.style.display = "block";
  } else {
    warningModal.style.display = "none";
  }
}

// -------------------------
// MODAL CONTROLS
// -------------------------

openModalBtn.onclick = () => {
  modal.style.display = "block";
};

closeModalBtn.onclick = () => {
  modal.style.display = "none";
};

closeWarningModalBtn.onclick = () => {
  warningModal.style.display = "none";
};

// -------------------------
// ADD NEW OUTGOING
// -------------------------

addOutgoingBtn.onclick = () => {
  const name = document.getElementById("newName").value.trim();
  const amount = parseFloat(document.getElementById("newAmount").value);
  const date = parseInt(document.getElementById("newDate").value);

  if (!name || isNaN(amount) || amount <= 0 || isNaN(date) || date < 1 || date > 31) {
    alert("Please enter valid outgoing details.");
    return;
  }

  outgoings.push({ name, amount, date });
  saveOutgoings();
  renderOutgoings();
  calculateRemaining();

  // Clear inputs
  document.getElementById("newName").value = "";
  document.getElementById("newAmount").value = "";
  document.getElementById("newDate").value = "";
};

// -------------------------
// CALCULATE BUTTON
// -------------------------

calculateBtn.onclick = () => {
  calculateRemaining();
};

// Expose updateOutgoing and deleteOutgoing to global scope for inline handlers
window.updateOutgoing = updateOutgoing;
window.deleteOutgoing = deleteOutgoing;
