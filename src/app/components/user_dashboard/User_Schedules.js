import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentChat } from '../../../store/slices/currentChatSlice';
const SchedulesList = ({}) => {
  const userData = useSelector((state) => state.userData.value)
  console.log(userData)
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useRouter()
  let user_id = 2;//userData.user_id
  const dispatch = useDispatch()
  const handleInitiateChat = async (companyId,  userId) => {
    try {
      const response = await fetch('/api/chat/create_chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ company_id: companyId  , user_id: userId}),
      });
      const result = await response.json();
      if (response.ok) {
        dispatch(setCurrentChat(result.data.chat_id))
        alert('Chat initiated successfully!');
        navigate.push('/chat') ;
        
      } else {
        alert(`Failed to initiate chat: ${result.message}`);
      }
    } catch (err) {
      console.error('Error initiating chat:', err);
      alert('An error occurred while initiating the chat.');
    }
  };

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await fetch(`/api/schedule/get_schedule_for_user/${user_id}`);
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
    
  }, [userData]);

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
            <button onClick={() => handleInitiateChat(schedule.company_id  ,schedule.user_id)}>Contact Company</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SchedulesList;
