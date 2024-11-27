"use client"; 
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentChat } from '../../../store/slices/currentChatSlice';
import axios from 'axios';

const Waste_Schedules = ({}) => {
  const [schedules, setSchedules] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const navigate = useRouter();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.userData.value);
  const [showForm, setShowForm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [weights, setWeights] = useState({});
  const [wastePrices, setWastePrices] = useState([]);
  const [Rating, setRating] = useState();

  let companyId = userData.user_id;

  useEffect(() => {
    const fetchCompanyRating = async () => {
      try {
        const response = await axios.get(`/api/schedule/get_company_rating/${companyId}`);
        console.log("Company rating : ", response);
        setRating(response.data.data);
      } catch (error) {
        console.log("Error fetching company rating:", error);
      }
    };

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
        console.log(data);
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
        console.log(error);
      }
    };

    fetchCompanyRating();
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
        setSchedules((prevSchedules) =>
          prevSchedules.map((schedule) =>
            schedule.schedule_id == result.schedule.schedule_id ? result.schedule : schedule
          )
        );
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

  const handleInitiateChat = async (company_id, userId) => {
    try {
      const response = await fetch('/api/chat/create_chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ company_id, user_id: userId }),
      });
      const result = await response.json();
      if (response.ok) {
        dispatch(setCurrentChat(result.data.chat_id));
        alert('Chat initiated successfully!');
        navigate.push('/chat');
      } else {
        alert(`Failed to initiate chat: ${result.message}`);
      }
    } catch (err) {
      console.error('Error initiating chat:', err);
      alert('An error occurred while initiating the chat.');
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
        const { updatedSchedule } = response.data;
        setSchedules((prevSchedules) =>
          prevSchedules.map((schedule) =>
            schedule.schedule_id == updatedSchedule.schedule_id ? updatedSchedule : schedule
          )
        );
      }
    } catch (error) {
      console.error('Error marking schedule as done:', error);
      alert('An error occurred while marking the schedule as done.');
    }
  };

  if (loading) return <p>Loading company schedules...</p>;
  if (schedules.length === 0) return <><p>Current rating : {Rating}</p><p>No schedules found for this company.</p></>;

  return (
    <div>
      <p>Current rating : {Rating}</p>
      <h2>Company Schedules</h2>
      <ul>
        {schedules.map((schedule) => (
          schedule.status !== 'done' && (
            <li key={schedule.schedule_id}>
              <p><strong>Date:</strong> {schedule.date}</p>
              <p><strong>Time:</strong> {schedule.time}</p>
              <p><strong>Status:</strong> {schedule.status}</p>
              <button onClick={() => handleInitiateChat(schedule.company_id, schedule.user_id)}>Contact User</button>
              <br />
              {schedule.status === 'Scheduled' && (
                <div>
                  <label>
                    Select Truck:
                    <select value={selectedTruck} onChange={(e) => setSelectedTruck(e.target.value)}>
                      <option value="">Choose a truck</option>
                      {trucks.map((truck) => (
                        <option key={truck.truckid} value={truck.truckid}>
                          {truck.licenseplate}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button onClick={() => handleAssignTruck(schedule.schedule_id)} disabled={assigning}>
                    {assigning ? 'Assigning...' : 'Assign Truck'}
                  </button>
                </div>
              )}
              {schedule.status === 'Scheduled' && (
                <button onClick={() => handleMarkAsDone(schedule.schedule_id)}>Mark as Done</button>
              )}
            </li>
          )
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
                onChange={(e) => setWeights({ ...weights, [item.name]: e.target.value })}
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
