import React, { useState, useEffect } from 'react';
import { activityService } from '../services/api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Analysis = () => {
  const [period, setPeriod] = useState('daily');
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalysis();
  }, [period]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      let apiData;
      
      // Fetch appropriate data based on period
      switch (period) {
        case 'daily':
          apiData = await activityService.getWeeklyAnalysis();
          break;
        case 'monthly':
          apiData = await activityService.getYearlyAnalysis();
          break;
        case 'yearly':
          // For yearly, we need all activities to group by year
          const allActivities = await activityService.getAllActivities();
          
          // Calculate analysis from all activities
          const maxSleep = 9;
          let totalLearning = 0, totalSleep = 0, totalOffice = 0, totalWasted = 0;
          
          allActivities.forEach((activity) => {
            const sleepHours = Math.min(activity.sleep_hours, maxSleep);
            const usedHours = activity.learning_hours + sleepHours + activity.office_hours;
            const wastedHours = Math.max(0, 24 - usedHours);
            
            totalLearning += activity.learning_hours;
            totalSleep += sleepHours;
            totalOffice += activity.office_hours;
            totalWasted += wastedHours;
          });
          
          const days = allActivities.length || 1;
          apiData = {
            analysis: {
              total_days: allActivities.length,
              avg_learning_hours: totalLearning / days,
              avg_sleep_hours: totalSleep / days,
              avg_office_hours: totalOffice / days,
              avg_wasted_hours: totalWasted / days,
              total_learning: totalLearning,
              total_sleep: totalSleep,
              total_office: totalOffice,
              total_wasted: totalWasted,
            },
            data: allActivities
          };
          break;
        default:
          apiData = await activityService.getWeeklyAnalysis();
      }
      
      setAnalysisData(apiData);
      setError('');
    } catch (err) {
      setError('Failed to fetch analysis data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading analysis...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!analysisData || !analysisData.analysis) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        <p>No data available for analysis. Start tracking your activities!</p>
      </div>
    );
  }

  const { analysis, data } = analysisData;

  // Prepare chart data based on period
  const prepareChartData = () => {
    const maxSleep = 9;
    
    if (period === 'daily') {
      // Show individual bars for each day (last 7 days)
      return data.slice(-7).map((activity) => {
        const sleepHours = Math.min(activity.sleep_hours, maxSleep);
        const usedHours = activity.learning_hours + sleepHours + activity.office_hours;
        const wastedHours = Math.max(0, 24 - usedHours);
        
        return {
          period: activity.date,
          Learning: activity.learning_hours,
          Sleep: sleepHours,
          Office: activity.office_hours,
          Wasted: wastedHours,
        };
      });
    } else if (period === 'monthly') {
      // Show month-wise for current year
      const monthlyData = {};
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentYear = new Date().getFullYear();
      
      data.forEach((activity) => {
        const date = new Date(activity.date);
        if (date.getFullYear() === currentYear) {
          const monthKey = monthNames[date.getMonth()];
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { Learning: 0, Sleep: 0, Office: 0, Wasted: 0, monthIndex: date.getMonth() };
          }
          
          const sleepHours = Math.min(activity.sleep_hours, maxSleep);
          const usedHours = activity.learning_hours + sleepHours + activity.office_hours;
          const wastedHours = Math.max(0, 24 - usedHours);
          
          monthlyData[monthKey].Learning += activity.learning_hours;
          monthlyData[monthKey].Sleep += sleepHours;
          monthlyData[monthKey].Office += activity.office_hours;
          monthlyData[monthKey].Wasted += wastedHours;
        }
      });
      
      return Object.keys(monthlyData)
        .sort((a, b) => monthlyData[a].monthIndex - monthlyData[b].monthIndex)
        .map(month => ({
          period: month,
          Learning: monthlyData[month].Learning,
          Sleep: monthlyData[month].Sleep,
          Office: monthlyData[month].Office,
          Wasted: monthlyData[month].Wasted,
        }));
    } else {
      // Yearly: Group by year and show bars for each year (2026, 2025, 2024, etc.)
      const yearlyData = {};
      
      data.forEach((activity) => {
        const date = new Date(activity.date);
        const year = date.getFullYear();
        
        if (!yearlyData[year]) {
          yearlyData[year] = { Learning: 0, Sleep: 0, Office: 0, Wasted: 0 };
        }
        
        const sleepHours = Math.min(activity.sleep_hours, maxSleep);
        const usedHours = activity.learning_hours + sleepHours + activity.office_hours;
        const wastedHours = Math.max(0, 24 - usedHours);
        
        yearlyData[year].Learning += activity.learning_hours;
        yearlyData[year].Sleep += sleepHours;
        yearlyData[year].Office += activity.office_hours;
        yearlyData[year].Wasted += wastedHours;
      });
      
      return Object.keys(yearlyData)
        .sort((a, b) => b - a) // Sort years in descending order (2026, 2025, 2024...)
        .map(year => ({
          period: year,
          Learning: yearlyData[year].Learning,
          Sleep: yearlyData[year].Sleep,
          Office: yearlyData[year].Office,
          Wasted: yearlyData[year].Wasted,
        }));
    }
  };
  
  const chartData = prepareChartData();

  return (
    <div className="analysis-container">
      <h2 style={{ marginBottom: '20px', color: '#333', textAlign: 'center' }}>
        Activity Analysis
      </h2>

      <div className="analysis-tabs">
        <button
          className={`analysis-tab ${period === 'daily' ? 'active' : ''}`}
          onClick={() => setPeriod('daily')}
        >
          Daily
        </button>
        <button
          className={`analysis-tab ${period === 'monthly' ? 'active' : ''}`}
          onClick={() => setPeriod('monthly')}
        >
          Monthly
        </button>
        <button
          className={`analysis-tab ${period === 'yearly' ? 'active' : ''}`}
          onClick={() => setPeriod('yearly')}
        >
          Yearly
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Days Tracked</div>
          <div className="stat-value">{analysis.total_days}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Learning Hours</div>
          <div className="stat-value">{analysis.avg_learning_hours?.toFixed(1) || 0}h</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Sleep Hours</div>
          <div className="stat-value">{analysis.avg_sleep_hours?.toFixed(1) || 0}h</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Office Hours</div>
          <div className="stat-value">{analysis.avg_office_hours?.toFixed(1) || 0}h</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Wasted Hours</div>
          <div className="stat-value" style={{ color: '#F44336' }}>
            {analysis.avg_wasted_hours?.toFixed(1) || 0}h
          </div>
        </div>
      </div>

      <div className="chart-container">
        <h3 className="chart-title">
          {period === 'daily' ? 'Daily Hours (Last 7 Days)' :
           period === 'monthly' ? 'Monthly Breakdown (Current Year)' :
           'Yearly Breakdown (By Year)'}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Learning" fill="#4CAF50" />
            <Bar dataKey="Sleep" fill="#2196F3" />
            <Bar dataKey="Office" fill="#FFC107" />
            <Bar dataKey="Wasted" fill="#F44336" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3 className="chart-title">
          {period === 'daily' ? 'Daily Trend (Last 7 Days)' :
           period === 'monthly' ? 'Monthly Trend (Current Year)' :
           'Yearly Trend (By Year)'}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Learning" stroke="#4CAF50" strokeWidth={2} />
            <Line type="monotone" dataKey="Sleep" stroke="#2196F3" strokeWidth={2} />
            <Line type="monotone" dataKey="Office" stroke="#FFC107" strokeWidth={2} />
            <Line type="monotone" dataKey="Wasted" stroke="#F44336" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Learning Hours</div>
          <div className="stat-value">{analysis.total_learning?.toFixed(1) || 0}h</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Sleep Hours</div>
          <div className="stat-value">{analysis.total_sleep?.toFixed(1) || 0}h</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Office Hours</div>
          <div className="stat-value">{analysis.total_office?.toFixed(1) || 0}h</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Wasted Hours</div>
          <div className="stat-value" style={{ color: '#F44336' }}>
            {analysis.total_wasted?.toFixed(1) || 0}h
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;

// Made with Bob
