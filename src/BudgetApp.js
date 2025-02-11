import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "bootstrap/dist/css/bootstrap.min.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { eachDayOfInterval, format, startOfMonth, endOfMonth } from "date-fns";
import { Modal, Button, Form, Navbar } from "react-bootstrap";
import { FaEdit, FaPalette, FaTimes, FaPlus, FaCalendarAlt } from "react-icons/fa";
import { SketchPicker } from "react-color";
import { CSVLink } from "react-csv";
import Transaction from "./Transaction";
import Day from "./Day";
import { generateCSVData, importCSVData } from "./csvUtils";

const ItemTypes = { TRANSACTION: "transaction" };

export default function BudgetApp() {
  const [transactions, setTransactions] = useState(() => {
    const savedTransactions = localStorage.getItem("transactions");
    return savedTransactions ? JSON.parse(savedTransactions) : [];
  });
  const [templates, setTemplates] = useState(() => {
    const savedTemplates = localStorage.getItem("templates");
    return savedTemplates ? JSON.parse(savedTemplates) : [
      { name: "Paycheck", amount: 2000, color: "#007bff" },
      { name: "Rent", amount: -1200, color: "#dc3545" },
      { name: "Groceries", amount: -200, color: "#28a745" },
    ];
  });
  const [openingBalance, setOpeningBalance] = useState(() => {
    const savedOpeningBalance = localStorage.getItem("openingBalance");
    return savedOpeningBalance ? Number(savedOpeningBalance) : 0;
  });
  const [startDate, setStartDate] = useState(() => {
    const savedStartDate = localStorage.getItem("startDate");
    return savedStartDate ? new Date(savedStartDate) : startOfMonth(new Date());
  });
  const [endDate, setEndDate] = useState(() => {
    const savedEndDate = localStorage.getItem("endDate");
    return savedEndDate ? new Date(savedEndDate) : endOfMonth(new Date());
  });
  const [newTransactionName, setNewTransactionName] = useState("");
  const [newTransactionAmount, setNewTransactionAmount] = useState("");
  const [newTransactionColor, setNewTransactionColor] = useState("#007bff");
  const [showNewTransactionColorPicker, setShowNewTransactionColorPicker] = useState(false);
  const [saveProgress, setSaveProgress] = useState(() => {
    const savedSaveProgress = localStorage.getItem("saveProgress");
    return savedSaveProgress ? JSON.parse(savedSaveProgress) : false;
  });
  const [showAddTransactionForm, setShowAddTransactionForm] = useState(false);

  useEffect(() => {
    if (saveProgress) {
      localStorage.setItem("transactions", JSON.stringify(transactions));
      localStorage.setItem("templates", JSON.stringify(templates));
      localStorage.setItem("openingBalance", openingBalance.toString());
      localStorage.setItem("startDate", startDate.toISOString());
      localStorage.setItem("endDate", endDate.toISOString());
    }
  }, [transactions, templates, openingBalance, startDate, endDate, saveProgress]);

  const updateTemplate = (index, updatedTransaction) => {
    setTemplates((prev) => prev.map((t, i) => (i === index ? updatedTransaction : t)));
  };

  const addTransaction = (date, transaction) => {
    setTransactions((prev) => [...prev, { ...transaction, date: format(date, "MMM d") }]);
  };

  const removeTransaction = (transactionToRemove) => {
    setTemplates((prev) => prev.filter((t) => t !== transactionToRemove));
  };

  const removeTransactionFromDate = (transactionToRemove) => {
    setTransactions((prev) => prev.filter((t) => t !== transactionToRemove));
  };

  const calculateClosingBalance = () => {
    return transactions.reduce((acc, t) => acc + t.amount, openingBalance);
  };

  const addNewTransaction = () => {
    if (newTransactionName && newTransactionAmount) {
      setTemplates((prev) => [...prev, { name: newTransactionName, amount: Number(newTransactionAmount), color: newTransactionColor }]);
      setNewTransactionName("");
      setNewTransactionAmount("");
      setNewTransactionColor("#007bff");
      setShowNewTransactionColorPicker(false);
      setShowAddTransactionForm(false);
    }
  };

  const resetApp = () => {
    const savedStartDate = localStorage.getItem("startDate");
    const savedEndDate = localStorage.getItem("endDate");
    setTransactions([]);
    setTemplates([
      { name: "Paycheck", amount: 2000, color: "#007bff" },
      { name: "Rent", amount: -1200, color: "#dc3545" },
      { name: "Groceries", amount: -200, color: "#28a745" },
    ]);
    setOpeningBalance(0);
    setStartDate(savedStartDate ? new Date(savedStartDate) : startOfMonth(new Date()));
    setEndDate(savedEndDate ? new Date(savedEndDate) : endOfMonth(new Date()));
    setNewTransactionName("");
    setNewTransactionAmount("");
    setNewTransactionColor("#007bff");
    setShowNewTransactionColorPicker(false);
    setShowAddTransactionForm(false);
  };

  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvString = e.target.result;
        const { transactions, openingBalance, startDate, endDate } = importCSVData(csvString);
        setTransactions(transactions);
        setOpeningBalance(openingBalance);
        setStartDate(startDate);
        setEndDate(endDate);
      };
      reader.readAsText(file);
    }
  };

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const firstDayOfMonth = startDate.getDay(); // 0 (Sunday) to 6 (Saturday)
  const placeholders = Array.from({ length: firstDayOfMonth }, () => null);
  const allDays = [...placeholders, ...days];

  // Add placeholders at the end to ensure the last week contains 7 days
  const lastWeekLength = allDays.length % 7;
  if (lastWeekLength !== 0) {
    const endPlaceholders = Array.from({ length: 7 - lastWeekLength }, () => null);
    allDays.push(...endPlaceholders);
  }

  // Group days into subarrays of 7 days each
  const groupedDays = [];
  for (let i = 0; i < allDays.length; i += 7) {
    groupedDays.push(allDays.slice(i, i + 7));
  }

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-top">
          <h1 className="mb-4 fs-2">Cashflow</h1>
          <div className="mb-4 fs-2">Closing Balance: ${calculateClosingBalance()}</div>
        </div>
        <div className="mb-4 d-flex gap-3 align-items-center">
          <Form.Check
            type="switch"
            id="save-progress-switch"
            label="Save Progress"
            checked={saveProgress}
            onChange={(e) => {
              setSaveProgress(e.target.checked);
              localStorage.setItem("saveProgress", JSON.stringify(e.target.checked));
              if (!e.target.checked) {
                localStorage.removeItem("transactions");
                localStorage.removeItem("templates");
                localStorage.removeItem("openingBalance");
                localStorage.removeItem("startDate");
                localStorage.removeItem("endDate");
              }
            }}
          />
          <CSVLink
            data={generateCSVData(transactions, openingBalance, startDate, endDate)}
            headers={[
              { label: "Date", key: "Date" },
              { label: "Transaction", key: "Transaction" },
              { label: "Amount", key: "Amount" },
              { label: "Balance", key: "Balance" },
            ]}
            filename={"cashflow.csv"}
            className="btn btn-primary btn-sm"
          >
            Export to CSV
          </CSVLink>
          <Button variant="outline-danger" size="sm" onClick={resetApp}>Reset</Button>
		  <Form.Control type="file" size="sm" className="btn btn-outline-primary btn-sm w-25" accept=".csv" onChange={handleImportCSV} />
        </div>
        <div className="mb-4 d-flex gap-3 align-items-center">
          <label className="me-2">Opening Balance:</label>
          <input
            type="number"
            value={openingBalance}
            onChange={(e) => setOpeningBalance(Number(e.target.value))}
            className="form-control d-inline w-auto"
          />
        </div>
        <div className="mb-4 d-flex gap-3 align-items-center">
          <label className="me-2">Select Date Range:</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            className="form-control d-inline"
          />
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            className="form-control d-inline"
          />
        </div>
        <Navbar sticky="top" className="d-flex gap-3 mb-4 bg-body-tertiary overflow-auto">
          {templates.map((t, index) => (
            <Transaction key={index} transaction={t} onUpdate={(newT) => updateTemplate(index, newT)} onRemove={removeTransaction} onAddToDate={addTransaction} startDate={startDate} endDate={endDate} />
          ))}
        </Navbar>
        {!showAddTransactionForm && (
          <div className="mb-4">
            <Button variant="link" onClick={() => setShowAddTransactionForm(true)}>
              <FaPlus /> Add Transaction
            </Button>
          </div>
        )}
        {showAddTransactionForm && (
          <div className="mb-4 d-flex align-items-center">
            <input
              type="text"
              placeholder="Transaction Name"
              value={newTransactionName}
              onChange={(e) => setNewTransactionName(e.target.value)}
              className="form-control d-inline w-25 me-2"
            />
            <input
              type="number"
              placeholder="Amount"
              value={newTransactionAmount}
              onChange={(e) => setNewTransactionAmount(Number(e.target.value))}
              className="form-control d-inline w-25 me-2"
            />
            <div className="d-flex align-items-center me-2">
              <Button variant="outline-secondary" onClick={() => setShowNewTransactionColorPicker(!showNewTransactionColorPicker)}>
                {showNewTransactionColorPicker ? <FaTimes /> : <FaPalette />}
              </Button>
              {showNewTransactionColorPicker && (
                <div className="ms-3">
                  <SketchPicker
                    color={newTransactionColor}
                    onChangeComplete={(color) => setNewTransactionColor(color.hex)}
                  />
                </div>
              )}
            </div>
            <button onClick={addNewTransaction} className="btn btn-primary">Add Transaction</button>
            <Button variant="danger" onClick={() => setShowAddTransactionForm(false)} className="ms-2">
              <FaTimes className="text-white" />
            </Button>
          </div>
        )}
        <div className="row row-cols-7 g-2 mb-2">
          {daysOfWeek.map((day, index) => (
            <div className="col text-center fw-bold" key={index}>
              {day}
            </div>
          ))}
        </div>
        {groupedDays.map((week, weekIndex) => (
          <div className="row g-2 mb-4" key={weekIndex}>
            {week.map((day, dayIndex) => (
              <div className="col-12 col-md mb-4" key={dayIndex}>
                {day && (
                  <Day
                    date={format(day, "MMM d")}
                    transactions={transactions.filter((t) => t.date === format(day, "MMM d"))}
                    addTransaction={addTransaction}
                    removeTransactionFromDate={removeTransactionFromDate}
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </DndProvider>
  );
}