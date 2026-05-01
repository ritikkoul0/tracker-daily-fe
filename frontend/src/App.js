import React, { useState } from 'react';
import './App.css';
import ActivityForm from './components/ActivityForm';
import ActivityList from './components/ActivityList';
import Analysis from './components/Analysis';

function App() {
  const [activeTab, setActiveTab] = useState('add');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleActivityAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="App">
      <div className="header">
        <h1>📊 Daily Tracker</h1>
        <p>Track your learning, sleep, and office hours</p>
      </div>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          ➕ Add Activity
        </button>
        <button
          className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          📋 View Activities
        </button>
        <button
          className={`tab-button ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          📈 Analysis
        </button>
      </div>

      <div className="content-card">
        {activeTab === 'add' && (
          <ActivityForm onActivityAdded={handleActivityAdded} />
        )}
        {activeTab === 'list' && (
          <ActivityList refreshTrigger={refreshTrigger} />
        )}
        {activeTab === 'analysis' && <Analysis />}
      </div>
    </div>
  );
}

export default App;

// Made with Bob
