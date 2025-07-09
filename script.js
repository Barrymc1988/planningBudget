const modal = document.getElementById("budgetModal");
const openModalBtn = document.getElementById("openModal");
const closeModalBtn = document.getElementById("closeModal");
const calculateBtn = document.getElementById("calculate");
const addOutgoingBtn = document.getElementById("addOutgoing");
const outgoingsTable = document.getElementById("outgoingsTable");
const remainingEl = document.getElementById("remaining");

// Load outgoings from localStorage or use defaults
const defaultOutgoings = [
  { name: "CHILDCARE", amount: 150.0, date: 1 },
  { name: "CRED", amount: 240.0, date: 1 },
  { name: "KEEP", amount: 300.0, date: 1 },
  { name: "LOTTOS", amount: 200.0, date: 1 },
  { name: "VEHICLE TAX", amount: 60.0, date: 1 },
  { name: "CAR INS", amount: 59.0, date: 1 },
  { name: "CAPITAL ONE", amount: 17.8, date: 2 },
  { name: "CAPITAL ONE", amount: 15.35, date: 2 },
  { name: "ISA", amount: 200.0, date: 2 },
  { name: "CREATION", amount: 28.29, date: 3 },
  { name: "VOXI", amount: 10.0, date: 3 },
  { name: "YOU FIBRE", amount: 29.99, date: 3 },
  { name: "B/CARD", amount: 200.0, date: 6 },
  { name: "VAN INS", amount: 49.0, date: 7 },
  { name: "NETFLIX", amount: 12.99, date: 9 },
  { name: "OVERDRAFT FEE", amount: 49.0, date: 18 },
  { name: "EXPERIAN", amount: 14.99, date: 19 },
  { name: "PHONE", amount: 10.0, date: 23 },
  { name: "DIESEL", amount: 150.0, date: 27 },
  { name: "FEE", amount: 5.0, date: 27 },
];

let outgoings = [];
function loadOutgoings() {
  const saved = localStorage.getItem("outgoings");
  if (saved) {
    try {
      outgoings = JSON.parse(saved);
    } catch {
      outgoings = [...defaultOutgoings];
    }
  } else {
    outgoings = [...defaultOutgoings];
  }
}
function saveOutgoings() {
  localStorage.setItem("outgoings", JSON.stringify(outgoings));
}

function renderOutgoings() {
  outgoingsTable.innerHTML = "";
  const today = new Date().getDate();
  outgoings.forEach((item, index) => {
    const paid = today >= item.date;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><input type="text" value="${item.name}" onchange="updateOutgoing(${index}, 'name', this.value)" /></td>
      <td><input type="number" value="${item.amount.toFixed(2)}" step="0.01" onchange="updateOutgoing(${index}, 'amount', parseFloat(this.value))" /></td>
      <td><input type="number" value="${item.date}" min="1" max="31" onchange="updateOutgoing(${index}, 'date', parseInt(this.value))" /></td>
      <td class="${paid ? "paid" : "not-paid"}">${paid ? "Paid" : "Not Paid"}</td>
    `;
    outgoingsTable.appendChild(row);
  });
}

window.updateOutgoing = (index, key, value) => {
  if (key === "amount" && (isNaN(value) || value < 0)) return;
  if (key === "date" && (isNaN(value) || value < 1 || value > 31)) return;
  outgoings[index][key] = value;
  saveOutgoings();
  renderOutgoings();
  calculateRemaining();
};

function calculateRemaining() {
  const income = parseFloat(document.getElementById("income").value) || 0;
  const totalOutgoings = outgoings.reduce(
    (sum, item) => sum + parseFloat(item.amount || 0), 0
  );
  const remaining = income - totalOutgoings;
  remainingEl.textContent = remaining.toFixed(2);

  const today = new Date().getDate();
  const notPaidSum = outgoings
    .filter(item => today < item.date)
    .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

  document.getElementById("remainingOutgoings").textContent = notPaidSum.toFixed(2);

  // Disposable income is now remaining income - remaining outgoings
  const disposableIncome = remaining - notPaidSum;
  document.getElementById("disposableIncome").textContent = disposableIncome.toFixed(2);

  if (notPaidSum >= remaining) {
    remainingEl.style.color = "red";
  } else if (remaining - notPaidSum <= 100) {
    remainingEl.style.color = "goldenrod";
  } else {
    remainingEl.style.color = "green";
  }
}

calculateBtn.onclick = calculateRemaining;

addOutgoingBtn.onclick = () => {
  const name = document.getElementById("newName").value.trim();
  const amount = parseFloat(document.getElementById("newAmount").value);
  const date = parseInt(document.getElementById("newDate").value);

  if (!name || isNaN(amount) || isNaN(date) || date < 1 || date > 31) {
    alert("Please enter valid outgoing name, amount and date (1-31).");
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

openModalBtn.onclick = () => {
  modal.style.display = "block";
  renderOutgoings();
};

closeModalBtn.onclick = () => {
  modal.style.display = "none";
};

window.onclick = (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

// Load and render on page load
loadOutgoings();
renderOutgoings();
calculateRemaining();
