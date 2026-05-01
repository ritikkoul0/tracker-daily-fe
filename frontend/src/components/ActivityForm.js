import React, { useState } from 'react';
import { activityService } from '../services/api';

const ActivityForm = ({ onActivityAdded }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    learning_hours: '',
    sleep_hours: '',
    office_hours: '',
    notes: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const dataToSubmit = {
        ...formData,
        learning_hours: parseFloat(formData.learning_hours) || 0,
        sleep_hours: parseFloat(formData.sleep_hours) || 0,
        office_hours: parseFloat(formData.office_hours) || 0,
      };

      await activityService.createActivity(dataToSubmit);
      setMessage({ type: 'success', text: 'Activity added successfully!' });
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        learning_hours: '',
        sleep_hours: '',
        office_hours: '',
        notes: '',
      });

      // Notify parent component
      if (onActivityAdded) {
        onActivityAdded();
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to add activity',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Add Daily Activity</h2>
      
      {message.text && (
        <div className={message.type}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="learning_hours">Learning Hours</label>
          <input
            type="number"
            id="learning_hours"
            name="learning_hours"
            value={formData.learning_hours}
            onChange={handleChange}
            step="0.5"
            min="0"
            max="24"
            placeholder="e.g., 3.5"
          />
        </div>

        <div className="form-group">
          <label htmlFor="sleep_hours">Sleep Hours (Max: 9)</label>
          <input
            type="number"
            id="sleep_hours"
            name="sleep_hours"
            value={formData.sleep_hours}
            onChange={handleChange}
            step="0.5"
            min="0"
            max="9"
            placeholder="e.g., 7.5"
          />
        </div>

        <div className="form-group">
          <label htmlFor="office_hours">Office Hours</label>
          <input
            type="number"
            id="office_hours"
            name="office_hours"
            value={formData.office_hours}
            onChange={handleChange}
            step="0.5"
            min="0"
            max="24"
            placeholder="e.g., 8"
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes (Optional)</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any additional notes about your day..."
          />
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Adding...' : 'Add Activity'}
        </button>
      </form>
    </div>
  );
};

export default ActivityForm;

// Made with Bob
