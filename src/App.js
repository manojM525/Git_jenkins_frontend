import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("Loading...");

  // ✅ Use environment variable or fallback to localhost
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://backend:5000";

  useEffect(() => {
    // ✅ Dynamic backend URL
    fetch(`${API_BASE_URL}/api/message`)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => {
        console.error("Error fetching message:", err);
        setMessage("Error connecting to backend");
      });
  }, [API_BASE_URL]); // Dependency for re-runs if base URL changes

  return (
    <div className="App">
      <h1>Frontend + Backend Integration Test</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;
