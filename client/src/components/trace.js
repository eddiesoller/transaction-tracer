import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";

export default function Trace() {
  const [form, setForm] = useState({
    date: "",
    team: "",
    acquired: [],
    relinquished: [],
    transactions: [],
  });
  const params = useParams();

  useEffect(() => {
    async function fetchData() {
      const id = params.id.toString();
      const response = await fetch(
        `http://localhost:5000/transaction/${params.id.toString()}`
      );

      if (!response.ok) {
        const message = `An error has occurred: ${response.statusText}`;
        window.alert(message);
        return;
      }

      const transaction = await response.json();
      if (!transaction) {
        window.alert(`Transaction with id ${id} not found`);
        return;
      }

      console.log(transaction);

      setForm(transaction);
    }

    fetchData();

    return;
  }, [params.id]);

  // These methods will update the state properties.
  function updateForm(value) {
    return setForm((prev) => {
      return { ...prev, ...value };
    });
  }

  // This following section will display the form that takes input from the user to update the data.
  return (
    <div>
      <h3>Update Transaction</h3>
      <form>
        <div className="form-group">
          <label htmlFor="date">Date: </label>
          <input
            type="text"
            className="form-control"
            id="date"
            value={form.date}
            onChange={(e) => updateForm({ date: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="team">Team: </label>
          <input
            type="text"
            className="form-control"
            id="team"
            value={form.team}
            onChange={(e) => updateForm({ team: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="acquired">Acquired: </label>
          <input
            type="text"
            className="form-control"
            id="acquired"
            value={form.acquired}
            onChange={(e) => updateForm({ acquired: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="relinquished">Relinquished: </label>
          <input
            type="text"
            className="form-control"
            id="relinquished"
            value={form.relinquished}
            onChange={(e) => updateForm({ relinquished: e.target.value })}
          />
        </div>
        <br />
      </form>
    </div>
  );
}
