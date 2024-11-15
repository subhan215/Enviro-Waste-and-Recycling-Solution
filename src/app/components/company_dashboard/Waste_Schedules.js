import { useEffect, useState } from 'react';
import axios from 'axios';

const Waste_Schedules = ({ companyId = 10 }) => {
  const [schedules, setSchedules] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [weights, setWeights] = useState({});
  const [wastePrices, setWastePrices] = useState([]);

  useEffect(() => {
    const fetchCompanySchedules = async () => {
      try {
        const response = await fetch(`/api/schedule/get_schedules_for_company/${companyId}`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setSchedules(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchCompanyTrucks = async () => {
      try {
        const response = await fetch(`/api/trucks/get_Trucks_Information/${companyId}`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setTrucks(data.data);
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchWastePrices = async () => {
      try {
        const response = await axios.get('/api/requests/get_waste_price');
        setWastePrices(response.data.data);
      } catch (error) {
        alert('Error while fetching waste prices: ', error);
      }
    };

    fetchWastePrices();
    fetchCompanySchedules();
    fetchCompanyTrucks();
  }, [companyId]);

  const handleAssignTruck = async (scheduleId) => {
    if (!selectedTruck) {
      alert('Please select a truck to assign.');
      return;
    }
    setAssigning(true);
    try {
      const response = await fetch('/api/schedule/assign_truck', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schedule_id: scheduleId,
          truck_id: selectedTruck,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        alert('Truck assigned successfully!');
      } else {
        alert(`Failed to assign truck: ${result.message}`);
      }
    } catch (err) {
      console.error('Error assigning truck:', err);
      alert('An error occurred while assigning the truck.');
    } finally {
      setAssigning(false);
    }
  };

  const handleMarkAsDone = (scheduleId) => {
    setSelectedSchedule(scheduleId);
    setShowForm(true);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const weightsData = wastePrices.map((item) => ({
      name: item.name,
      rate_per_kg: item.rate_per_kg,
      weight: weights[item.name] || 0,
    }));
    try {
      const response = await axios.post('/api/schedule/mark_as_done', {
        schedule_id: selectedSchedule,
        weights: weightsData,
      });
      if (response.status === 200) {
        alert('Schedule marked as done successfully!');
        setShowForm(false);
        setSelectedSchedule(null);
      }
    } catch (error) {
      console.error('Error marking schedule as done:', error);
      alert('An error occurred while marking the schedule as done.');
    }
  };

  if (loading) return <p>Loading company schedules...</p>;
  //if (error) return <p>Error: {error}</p>;
  if (schedules.length === 0) return <p>No schedules found for this company.</p>;

  return (
    <div>

      <h2>Company Schedules</h2>
      <ul>
        {schedules.map(schedule => (
          <li key={schedule.schedule_id}>
            <p><strong>Date:</strong> {schedule.date}</p>
            <p><strong>Time:</strong> {schedule.time}</p>
            <p><strong>Status:</strong> {schedule.status}</p>
            {schedule.price && <p><strong>Price:</strong> {schedule.price}</p>}
            <div>
              {schedule.truck_id ? (
                <p><strong>Assigned truck:</strong> {schedule.truck_id}</p>
              ) : (
                <>
                  <label htmlFor={`truck-select-${schedule.schedule_id}`}>Assign Truck: </label>
                  <select
                    id={`truck-select-${schedule.schedule_id}`}
                    onChange={(e) => setSelectedTruck(e.target.value)}
                  >
                    <option value="">Select a truck</option>
                    {trucks.map(truck => (
                      <option key={truck.truckid} value={truck.truckid}>
                        {truck.licenseplate} - {truck.capacity} capacity
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAssignTruck(schedule.schedule_id)}
                    disabled={assigning}
                  >
                    {assigning ? 'Assigning...' : 'Assign Truck'}
                  </button>
                </>
              )}
              <button onClick={() => handleMarkAsDone(schedule.schedule_id)}>Mark as Done</button>
            </div>
          </li>
        ))}
      </ul>

      {showForm && (
        <form onSubmit={handleFormSubmit}>
          <h3>Enter received weights</h3>
          {wastePrices.map((item) => (
            <div key={item.name}>
              <label>{item.name} ({item.rate_per_kg} per kg):</label>
              <input
                type="number"
                value={weights[item.name] || ''}
                onChange={(e) =>
                  setWeights({ ...weights, [item.name]: e.target.value })
                }
              />
            </div>
          ))}
          <button type="submit">Submit</button>
        </form>
      )}
    </div>
  );
};

export default Waste_Schedules;
