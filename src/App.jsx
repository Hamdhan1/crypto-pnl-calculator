import React, { useState, useEffect } from "react";
import './index.css'

export default function App() {
  const [trades, setTrades] = useState(() => {
    const saved = localStorage.getItem("cryptoTrades");
    return saved ? JSON.parse(saved) : [];
  });

  const [form, setForm] = useState({
    type: "Spot",
    side: "Long",
    entry: "",
    exit: "",
    qty: "",
    leverage: 1,
    fee: 0.05,
    stoploss: "",
  });

  useEffect(() => {
    localStorage.setItem("cryptoTrades", JSON.stringify(trades));
  }, [trades]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const calcPnL = (t) => {
    const entry = parseFloat(t.entry);
    const exit = parseFloat(t.exit);
    const qty = parseFloat(t.qty);
    const lev = parseFloat(t.leverage);
    const fee = parseFloat(t.fee) / 100;

    if (!entry || !exit || !qty) return 0;

    let pnl =
      t.side === "Long"
        ? (exit - entry) * qty
        : (entry - exit) * qty;

    pnl = t.type === "Futures" ? pnl * lev : pnl;
    const feeAmt = (entry + exit) * qty * fee;
    return pnl - feeAmt;
  };

  const calcROI = (t) => {
    const margin = (parseFloat(t.entry) * parseFloat(t.qty)) / parseFloat(t.leverage);
    return ((calcPnL(t) / margin) * 100).toFixed(2);
  };

  const handleAdd = () => {
    if (!form.entry || !form.exit || !form.qty) return alert("Enter all values!");
    setTrades([...trades, form]);
    setForm({
      type: "Spot",
      side: "Long",
      entry: "",
      exit: "",
      qty: "",
      leverage: 1,
      fee: 0.05,
      stoploss: "",
    });
  };

  const handleDelete = (index) => {
    setTrades(trades.filter((_, i) => i !== index));
  };

  const handleClear = () => {
    if (window.confirm("Clear all trades?")) setTrades([]);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <h1 className="text-2xl font-bold text-center mb-6">📊 Crypto P&L Calculator</h1>

      <div className="max-w-3xl mx-auto bg-gray-900 p-6 rounded-xl shadow-lg">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <select name="type" value={form.type} onChange={handleChange} className="p-2 rounded bg-gray-800">
            <option>Spot</option>
            <option>Futures</option>
          </select>

          <select name="side" value={form.side} onChange={handleChange} className="p-2 rounded bg-gray-800">
            <option>Long</option>
            <option>Short</option>
          </select>

          <input name="entry" placeholder="Entry Price" value={form.entry} onChange={handleChange} className="p-2 rounded bg-gray-800" />
          <input name="exit" placeholder="Exit Price" value={form.exit} onChange={handleChange} className="p-2 rounded bg-gray-800" />
          <input name="qty" placeholder="Quantity" value={form.qty} onChange={handleChange} className="p-2 rounded bg-gray-800" />
          <input name="leverage" placeholder="Leverage" value={form.leverage} onChange={handleChange} className="p-2 rounded bg-gray-800" />
          <input name="fee" placeholder="Fee %" value={form.fee} onChange={handleChange} className="p-2 rounded bg-gray-800" />
          <input name="stoploss" placeholder="Stop Loss Price" value={form.stoploss} onChange={handleChange} className="p-2 rounded bg-gray-800" />
        </div>

        <button onClick={handleAdd} className="mt-4 w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg font-semibold">
          ➕ Add Trade
        </button>

        <button onClick={handleClear} className="mt-2 w-full bg-red-700 hover:bg-red-800 py-2 rounded-lg font-semibold">
          🧹 Clear All
        </button>
      </div>

      <div className="max-w-4xl mx-auto mt-8">
        <table className="w-full text-sm border border-gray-700">
          <thead className="bg-gray-800 text-gray-200">
            <tr>
              <th>Type</th>
              <th>Side</th>
              <th>Entry</th>
              <th>Exit</th>
              <th>Qty</th>
              <th>Lev</th>
              <th>Fee %</th>
              <th>P/L</th>
              <th>ROI %</th>
              <th>Stoploss</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t, i) => {
              const pnl = calcPnL(t);
              const roi = calcROI(t);
              return (
                <tr key={i} className="text-center border-t border-gray-700">
                  <td>{t.type}</td>
                  <td>{t.side}</td>
                  <td>{t.entry}</td>
                  <td>{t.exit}</td>
                  <td>{t.qty}</td>
                  <td>{t.leverage}</td>
                  <td>{t.fee}</td>
                  <td className={pnl >= 0 ? "text-green-400" : "text-red-400"}>{pnl.toFixed(2)}</td>
                  <td className={roi >= 0 ? "text-green-400" : "text-red-400"}>{roi}</td>
                  <td>{t.stoploss}</td>
                  <td>
                    <button onClick={() => handleDelete(i)} className="bg-red-600 px-2 py-1 rounded">
                      ✖
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <footer className="text-center mt-6 text-gray-400 text-sm">
        💾 Auto-saved locally | Made for Spot & Futures Traders
      </footer>
    </div>
  );
}
