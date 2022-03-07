import React from "react";

// We use Route in order to define the different routes of our application
import { Route, Routes } from "react-router-dom";

// We import all the components we need in our app
import Navbar from "./components/navbar";
import TransactionList from "./components/transactionList";
import About from "./components/about";
import Trace from "./components/trace";

const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route exact path="/" element={<TransactionList />} />
        <Route exact path="/about" element={<About />} />
        <Route path="/trace/:id" element={<Trace />} />
      </Routes>
    </div>
  );
};

export default App;
