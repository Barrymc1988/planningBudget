const registerSection = document.getElementById("registerSection");
const registerBtn = document.getElementById("registerBtn");
const regUsername = document.getElementById("regUsername");
const regPassword = document.getElementById("regPassword");

const loginSection = document.getElementById("loginSection");
const loginBtn = document.getElementById("loginBtn");
const usernameInput = document.getElementById("username");

const modal = document.getElementById("budgetModal");
const closeModalBtn = document.getElementById("closeModal");
const warningModal = document.getElementById("warningModal");
const closeWarningModal = document.getElementById("closeWarningModal");

const outgoingsTable = document.getElementById("outgoingsTable");
const disposableEl = document.getElementById("disposableIncome");
const remainingOutgoingsEl = document.getElementById("remainingOutgoings");
const paidOutgoingsEl = document.getElementById("paidOutgoings");
const incomeInput = document.getElementById("income");
const warningModalMessage = document.getElementById("warningModalText");

closeModalBtn.onclick = () => modal.style.display = "none";
closeWarningModal.onclick = () => warningModal.style.display = "none";

window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
  if (e.target === warningModal) warningModal.style.display = "none";
};

let currentUser = null;

const defaultOutgoings = [
  { name: "CHILDCARE", amount: 150, date: 1 },
  { name: "CRED", amount: 240, date: 1 },
  { name: "KEEP", amount: 300, date: 1 },
  { name: "LOTTOS", amount: 200, date: 1 },
  { name: "VEHICLE TAX", amount: 60, date: 1 },
  { name: "CAR INS", amount: 59, date: 1 },
  { name: "CAPITAL ONE", amount: 17.80, date: 2 },
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
  { name: "Rent", amount: 100, date: 1 }
];

let outgoings = [];

function hash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString();
}

registerBtn.onclick = () => {
  const username = regUsername.value.trim();
  const password = regPassword.value;
  if (!username || !password) return alert("Please enter a username and password.");
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  if (users[username]) return alert("Username already exists.");
  users[username] = hash(password);
  localStorage.setItem("users", JSON.stringify(users));
  alert("Registration successful!");
  regUsername.value = "";
  regPassword.value = "";
};

loginBtn.onclick = () => {
  const username = usernameInput.value.trim();
  const password = prompt("Enter your password:");
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  if (!users[username] || users[username] !== hash(password)) {
    alert("Invalid username or password.");
    return;
  }
  currentUser = username;
  loginSection.style.display = "none";
  registerSection.style.display = "none";
  loadOutgoings();
  renderOutgoings();
  showBudgetModal();
};

function showBudgetModal() {
  modal.style.display = "block";
}

function loadOutgoings() {
  if (!currentUser) return;
  const saved = localStorage.getItem("outgoings_" + currentUser);
  outgoings = saved ? JSON.parse(saved) : [...defaultOutgoings];
}

function saveOutgoings() {
  if (!currentUser) return;
  localStorage.setItem("outgoings_" + currentUser, JSON.stringify(outgoings));
}

function renderOutgoings() {
  outgoingsTable.innerHTML = "";
  const today = new Date().getDate();
  outgoings.sort((a, b) => a.date - b.date);
  outgoings.forEach((item, index) => {
    const paid = today >= item.date;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>£${item.amount.toFixed(2)}</td>
      <td>${item.date}</td>
      <td class="${paid ? "paid" : "not-paid"}">${paid ? "Paid" : "Not Paid"}</td>
      <td><button onclick="deleteOutgoing(${index})" style="color:red;">&#10006;</button></td>
    `;
    outgoingsTable.appendChild(tr);
  });
  calculateRemaining();
}

window.deleteOutgoing = (index) => {
  if (confirm("Delete this outgoing?")) {
    outgoings.splice(index, 1);
    saveOutgoings();
    renderOutgoings();
  }
};

function calculateRemaining() {
  const income = parseFloat(incomeInput.value) || 0;
  const today = new Date().getDate();
  let paid = 0, unpaid = 0;
  outgoings.forEach(o => {
    if (today >= o.date) paid += o.amount;
    else unpaid += o.amount;
  });
  let disposable = income - (paid + unpaid);
  disposable = Math.max(0, disposable);

  disposableEl.textContent = disposable.toFixed(2);

  disposableEl.className = "";
  if (disposable < 100) {
    disposableEl.classList.add("disposable-red");
  } else if (disposable <= 200) {
    disposableEl.classList.add("disposable-orange");
  } else {
    disposableEl.classList.add("disposable-green");
  }

  paidOutgoingsEl.textContent = paid.toFixed(2);
  remainingOutgoingsEl.textContent = unpaid.toFixed(2);

  if (disposable <= 200) {
    warningModalMessage.textContent = `Disposable income remaining is £${disposable.toFixed(2)}`;
    warningModalMessage.style.color =
      disposable < 100 ? "red" :
      disposable <= 200 ? "orange" : "green";
    warningModal.style.display = "block";
  } else {
    warningModal.style.display = "none";
  }
}

document.getElementById("addOutgoing").onclick = () => {
  const name = document.getElementById("newName").value.trim();
  const amount = parseFloat(document.getElementById("newAmount").value);
  const date = parseInt(document.getElementById("newDate").value);
  if (!name || isNaN(amount) || isNaN(date)) {
    alert("Please fill all outgoing fields.");
    return;
  }
  outgoings.push({ name, amount, date });
  saveOutgoings();
  renderOutgoings();
  document.getElementById("newName").value = "";
  document.getElementById("newAmount").value = "";
  document.getElementById("newDate").value = "";
};

incomeInput.addEventListener("input", () => calculateRemaining());
