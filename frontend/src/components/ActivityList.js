import React, { useState, useEffect } from 'react';
import { activityService } from '../services/api';

const ActivityList = ({ refreshTrigger }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchActivities();
  }, [refreshTrigger]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await activityService.getAllActivities();
      setActivities(data || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch activities');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await activityService.deleteActivity(id);
        fetchActivities();
      } catch (err) {
        alert('Failed to delete activity');
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading activities...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (activities.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        <p>No activities recorded yet. Start tracking your daily activities!</p>
      </div>
    );
  }

  const calculateWastedHours = (activity) => {
    const maxSleep = 9;
    const sleepHours = Math.min(activity.sleep_hours, maxSleep);
    const usedHours = activity.learning_hours + sleepHours + activity.office_hours;
    const wasted = 24 - usedHours;
    return wasted > 0 ? wasted.toFixed(1) : 0;
  };

  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Activity History</h2>
      <div className="activities-list">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-card">
            <div className="activity-header">
              <div className="activity-date">{activity.date}</div>
              <button
                className="delete-button"
                onClick={() => handleDelete(activity.id)}
              >
                Delete
              </button>
            </div>
            <div className="activity-details">
              <div className="detail-item">
                <span className="detail-label">Learning Hours</span>
                <span className="detail-value">{activity.learning_hours}h</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Sleep Hours</span>
                <span className="detail-value">{activity.sleep_hours}h</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Office Hours</span>
                <span className="detail-value">{activity.office_hours}h</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Wasted Hours</span>
                <span className="detail-value" style={{ color: '#F44336' }}>
                  {calculateWastedHours(activity)}h
                </span>
              </div>
            </div>
            {activity.notes && (
              <div className="activity-notes">
                <strong>Notes:</strong> {activity.notes}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityList;

// Made with Bob
