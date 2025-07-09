const registerSection = document.getElementById("registerSection");
const registerBtn = document.getElementById("registerBtn");
const regUsername = document.getElementById("regUsername");
const regPassword = document.getElementById("regPassword");

const loginSection = document.getElementById("loginSection");
const loginBtn = document.getElementById("loginBtn");
const usernameInput = document.getElementById("username");

const appSection = document.getElementById("appSection");

const modal = document.getElementById("budgetModal");
const openModalBtn = document.getElementById("openModal");
const closeModalBtn = document.getElementById("closeModal");
const calculateBtn = document.getElementById("calculate");
const addOutgoingBtn = document.getElementById("addOutgoing");
const outgoingsTable = document.getElementById("outgoingsTable");

const disposableEl = document.getElementById("disposableIncome");
const remainingOutgoingsEl = document.getElementById("remainingOutgoings");
const paidOutgoingsEl = document.getElementById("paidOutgoings");

const warningModal = document.getElementById("warningModal");
const warningModalText = document.getElementById("warningModalText");
const closeWarningModal = document.getElementById("closeWarningModal");

closeWarningModal.onclick = () => { warningModal.style.display = "none"; };

window.onclick = (event) => {
  if (event.target === modal) modal.style.display = "none";
  if (event.target === warningModal) warningModal.style.display = "none";
};

let currentUser = null;

function hash(str) {
  let hash = 0, i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash.toString();
}

registerBtn.onclick = () => {
  const username = regUsername.value.trim();
  const password = regPassword.value;
  if (!username || !password) { alert("Please enter a username and password."); return; }
  if (username.length < 3) { alert("Username must be at least 3 characters."); return; }
  if (password.length < 4) { alert("Password must be at least 4 characters."); return; }
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  if (users[username]) { alert("Username already exists."); return; }
  users[username] = hash(password);
  localStorage.setItem("users", JSON.stringify(users));
  alert("Registration successful! You can now log in.");
  regUsername.value = ""; regPassword.value = "";
};

loginBtn.onclick = () => {
  const username = usernameInput.value.trim();
  const password = prompt("Enter your password:");
  if (!username || !password) { alert("Please enter your username and password."); return; }
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  if (!users[username] || users[username] !== hash(password)) { alert("Invalid username or password."); return; }
  currentUser = username;
  loginSection.style.display = "none";
  registerSection.style.display = "none";
  appSection.style.display = "block";
  loadOutgoings(); renderOutgoings(); calculateRemaining();
};

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
  outgoings.sort((a,b) => a.date - b.date);
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

function calculateRemaining() {
  const incomeInput = document.getElementById("income").value;
  const income = parseFloat(incomeInput);

  if (isNaN(income) || income <= 0) {
    disposableEl.textContent = "0.00";
    remainingOutgoingsEl.textContent = "0.00";
    paidOutgoingsEl.textContent = "0.00";
    warningModal.style.display = "none";
    return;
  }

  const today = new Date().getDate();

  // Unpaid outgoings (date in future)
  const totalUnpaid = outgoings.reduce((sum, o) => (today < o.date ? sum + o.amount : sum), 0);

  // Paid outgoings (date reached or past)
  const totalPaid = outgoings.reduce((sum, o) => (today >= o.date ? sum + o.amount : sum), 0);

  // Disposable income = income - all outgoings (paid + unpaid)
  const disposableIncome = income - totalPaid - totalUnpaid;

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

openModalBtn.onclick = () => {
  modal.style.display = "block";
};

closeModalBtn.onclick = () => {
  modal.style.display = "none";
};

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

  document.getElementById("newName").value = "";
  document.getElementById("newAmount").value = "";
  document.getElementById("newDate").value = "";
};

calculateBtn.onclick = () => {
  calculateRemaining();
};
