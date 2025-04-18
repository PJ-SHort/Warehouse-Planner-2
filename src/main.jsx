import React from 'react';
import ReactDOM from 'react-dom/client';
import WarehousePlanner from './WarehousePlanner';  // ✅ Import default component
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WarehousePlanner />
  </React.StrictMode>
);
