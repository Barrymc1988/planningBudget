<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Budget Modal</title>
<link rel="stylesheet" href="style.css" />
</head>
<body>
  <div id="registerSection">
    <h3>Register</h3>
    <input type="text" id="regUsername" placeholder="Choose a username" />
    <input type="password" id="regPassword" placeholder="Choose a password" />
    <button id="registerBtn">Register</button>
  </div>

  <div id="loginSection">
    <h3>Login</h3>
    <input type="text" id="username" placeholder="Enter your name" />
    <button id="loginBtn">Login</button>
  </div>

  <div id="appSection" style="display:none;">
    <button id="openModal">Open Budget Modal</button>
  </div>

  <div id="budgetModal" class="modal">
    <div class="modal-content">
      <h3>Monthly Budget</h3>

      <label>Income:</label><br />
      <input type="number" id="income" placeholder="Enter income" /><br />
      <button id="calculate">Calculate Remaining</button>

      <h4>Outgoings</h4>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Outgoing</th>
              <th>Cost (£)</th>
              <th>Date</th>
              <th>Paid?</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody id="outgoingsTable"></tbody>
          <tfoot>
            <tr>
              <td><strong>Paid Outgoings</strong></td>
              <td colspan="4" id="paidOutgoings" style="font-weight:bold;">£0.00</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div>
        <strong>Remaining Outgoings: £<span id="remainingOutgoings">0.00</span></strong>
      </div>

      <p><strong>Disposable Income:</strong> <span id="disposableIncome">0.00</span></p>
      <p id="warningMessage" style="color:red; font-weight:bold; display:none;"></p>

      <h4>Add Outgoing</h4>
      <input type="text" id="newName" placeholder="Name" />
      <input type="number" id="newAmount" placeholder="Amount" step="0.01" />
      <input type="number" id="newDate" placeholder="Date" min="1" max="31" />
      <button id="addOutgoing">➕ Add Outgoing</button>

      <button id="closeModal">Close</button>
    </div>
  </div>

  <div id="warningModal" class="modal">
    <div class="modal-content">
      <span id="closeWarningModal" style="float:right;cursor:pointer;font-size:1.5em;">&times;</span>
      <h3>⚠️ Warning</h3>
      <p id="warningModalText">Disposable income remaining is £0.00</p>
    </div>
  </div>

  <script src="script.js"></script>
</body>
</html>
