import { useEffect, useState } from 'react';

const SchedulesList = ({ userId }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rewards, set_rewards] = useState(0);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await fetch(`/api/schedule/get_schedule_for_user/${1}`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setSchedules(data);
        console.log(data)
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    const get_user_rewards = async () => {
      try {
        const response = await fetch(`/api/schedule/get_rewards/${1}`); //User id supposed 1, needs to be dynamic
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        set_rewards(data.data);
        console.log(data)
      } catch (error) {
        console.log("Error in getting user rewards : " , error );
        
      }
    }

      get_user_rewards();
      fetchSchedules();
    
  }, [userId]);

  if (loading) return <p>Loading schedules...</p>;
  //if (error) return <p>Error: {error}</p>;
  if (schedules.length === 0) return <>
  <h2>Rewards Earned : {rewards}</h2>
  <p>No schedules found.</p>
  </>;

  return (
    <div>
      <h2>Rewards Earned : {rewards}</h2>
      <h2>Schedules</h2>
      <ul>
        {schedules.map(schedule => (
          <li key={schedule.schedule_id}>
            <p><strong>Date:</strong> {schedule.date}</p>
            <p><strong>Time:</strong> {schedule.time}</p>
            <p><strong>Status:</strong> {schedule.status}</p>
            {schedule.price && <p><strong>Price:</strong> {schedule.price}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SchedulesList;
