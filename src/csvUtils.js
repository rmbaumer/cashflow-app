import { format, parse } from "date-fns";
import Papa from "papaparse";

export const generateCSVData = (transactions, openingBalance, startDate, endDate) => {
  const csvData = [];
  let runningBalance = openingBalance;

  // Add start date row
  csvData.push({
    Date: format(startDate, "MMM d"),
    Transaction: "",
    Amount: "",
    Balance: runningBalance,
  });

  // Add transactions
  transactions.forEach((transaction) => {
    runningBalance += transaction.amount;
    csvData.push({
      Date: transaction.date,
      Transaction: transaction.name,
      Amount: transaction.amount,
      Balance: runningBalance,
    });
  });

  // Add end date row
  csvData.push({
    Date: format(endDate, "MMM d"),
    Transaction: "",
    Amount: "",
    Balance: runningBalance,
  });

  return csvData;
};

export const importCSVData = (csvString) => {
  const parsedData = Papa.parse(csvString, { header: true, skipEmptyLines: true }).data;
  const transactions = [];
  let openingBalance = 0;
  let startDate = null;
  let endDate = null;

  parsedData.forEach((row, index) => {
    if (index === 0) {
      openingBalance = Number(row.Balance);
      startDate = parse(row.Date, "MMM d", new Date());
    } else if (index === parsedData.length - 1) {
      endDate = parse(row.Date, "MMM d", new Date());
    } else {
      transactions.push({
        date: row.Date,
        name: row.Transaction,
        amount: Number(row.Amount),
      });
    }
  });

  return { transactions, openingBalance, startDate, endDate };
};