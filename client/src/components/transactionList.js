import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Transaction = (props) => (
  <tr style={{ cursor: "pointer" }} onClick={props.onClick}>
    <td>{props.transaction.date}</td>
    <td>{props.transaction.team}</td>
    <td>
      <ul>
        {props.transaction.acquired.map((acq) => (
          <li key={acq}>{acq}</li>
        ))}
      </ul>
    </td>
    <td>
      <ul>
        {props.transaction.relinquished.map((rel) => (
          <li key={rel}>{rel}</li>
        ))}
      </ul>
    </td>
  </tr>
);

export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();
  const trace = (id) => {
    navigate(`/trace/${id}`);
  };

  useEffect(() => {
    async function getTransactions() {
      const response = await fetch(`http://localhost:5000/transaction/`);

      if (!response.ok) {
        const message = `An error occurred: ${response.statusText}`;
        window.alert(message);
        return;
      }

      const transactions = await response.json();
      setTransactions(transactions);
    }

    getTransactions();

    return;
  }, [transactions.length]);

  function transactionList() {
    return transactions.map((transaction) => {
      return (
        <Transaction
          transaction={transaction}
          key={transaction._id}
          onClick={() => trace(transaction._id)}
        />
      );
    });
  }

  return (
    <div>
      <h3>Transaction List</h3>
      <table
        className="table table-hover table-striped table-sm"
        style={{ marginTop: 20 }}
      >
        <thead>
          <tr>
            <th>Date</th>
            <th>Team</th>
            <th>Acquired</th>
            <th>Relinquished</th>
          </tr>
        </thead>
        <tbody>{transactionList()}</tbody>
      </table>
    </div>
  );
}
