import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentChat } from '../../../store/slices/currentChatSlice';

const SchedulesList = ({}) => {
  const userData = useSelector((state) => state.userData.value);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    accountType: '',
    accountDetails: '',
    rewardAmount: '',
    wallet_Bank_name: ''
  });
  const [activeRequest, setActiveRequest] = useState(null);
  const navigate = useRouter();
  const dispatch = useDispatch();

  const user_id = userData.user_id
  const rewards = userData.rewards;
  const conversionRate = 0.5; // 1 reward = 0.5 PKR
  const equivalentPKR = rewards * conversionRate;

  const handleInitiateChat = async (companyId, userId) => {
    try {
      const response = await fetch('/api/chat/create_chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ company_id: companyId, user_id: userId }),
      });
      const result = await response.json();
      console.log(result)
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

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const { accountType, accountDetails, rewardAmount, wallet_Bank_name } = formData;
    if (!accountType || !accountDetails || !rewardAmount) {
      alert('Please fill in all fields.');
      return;
    }
    if (rewardAmount > rewards) {
      alert('You cannot convert more rewards than you have.');
      return;
    }

    try {
      const response = await fetch('/api/rewards/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id,
          account_type: accountType,
          account_details: accountDetails,
          conversion_amount: rewardAmount,
          wallet_Bank_name
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert('Transaction request created successfully!');
        setFormData({
          accountType: '',
          accountDetails: '',
          rewardAmount: '',
          wallet_Bank_name : ''
        });
        // Optionally, update rewards locally
        // userData.rewards -= rewardAmount; // Adjust if needed
      } else {
        alert(`Failed to create transaction request: ${result.message}`);
      }
    } catch (err) {
      console.error('Error creating transaction request:', err);
      alert('An error occurred while creating the transaction request.');
    }
  };

  const handleCancelRequest = async () => {
    try {
      const response = await fetch(`/api/rewards/cancel_request/${activeRequest.conversion_id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (response.ok) {
        setActiveRequest(null); // Clear active request in the state
        alert('Your request has been canceled successfully!');
      } else {
        alert(`Failed to cancel the request: ${result.message}`);
      }
    } catch (err) {
      console.error('Error canceling the request:', err);
      alert('An error occurred while canceling the request.');
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
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    const fetchActiveRequest = async () => {
      try {
        const response = await fetch(`/api/rewards/get_current_request/${user_id}`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setActiveRequest(data.data); // Assume only one active request per user
        }
      } catch (err) {
        console.error('Error fetching active request:', err);
      }
    };
    fetchSchedules();
    fetchActiveRequest();
  }, [userData]);
  const handleMarkAsSeen = async () => {
    try {
      const response = await fetch(`/api/rewards/mark_as_seen/${activeRequest.conversion_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const result = await response.json();
      if (response.ok) {
        alert('Request marked as seen.');
        setActiveRequest((prev) => ({ ...prev, isseen: true})); // Update state
      } else {
        alert(`Failed to mark request as seen: ${result.message}`);
      }
    } catch (err) {
      console.error('Error marking request as seen:', err);
      alert('An error occurred while marking the request as seen.');
    }
  };
  if (loading) return <p>Loading schedules...</p>;

  return (
    <div>
      <h2>Rewards Earned: {rewards}</h2>
      <h3>Equivalent in PKR: {equivalentPKR} PKR</h3>
      {activeRequest && (activeRequest.status!= 'Rejected' && activeRequest.status!= 'Approved')  ? (
        <div>
          <p>You already have a pending transaction request. Please wait for it to be processed before creating another.</p>
          <div>
            <p>Active request details</p>
            <p>Account Type: {activeRequest.account_type}</p>
            <p>{activeRequest.account_type === "wallet" ? "Wallet" : "Bank"} : {activeRequest.wallet_bank_name}</p>
            <p>Account details: {activeRequest.account_details}</p>
            <p>Rewards to convert: {activeRequest.conversion_amount}</p>
            <p>Equivalent PKR: {activeRequest.equivalent_pkr}</p>
            <button onClick={handleCancelRequest}>Cancel Current Request</button>
          </div>
        </div>
      ) : (
        <>
          {activeRequest && (activeRequest.status === 'Approved' || activeRequest.status === 'Rejected') && (
  <div>
    <p>
      Your request has been {activeRequest.status}.{' '}
      {!activeRequest.is_seen && (
        <button onClick={handleMarkAsSeen}>
          Mark as Seen
        </button>
      )}
    </p>
  </div> )}
          <button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel Conversion' : 'Convert Rewards into Account'}
          </button>
          {showForm && (
            <form onSubmit={handleFormSubmit}>
              <div>
                <label>
                  Account Type:
                  <select
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleFormChange}
                  >
                    <option value="">Select</option>
                    <option value="bank">Bank</option>
                    <option value="wallet">Wallet</option>
                  </select>
                </label>
              </div>
              <div>
                <label>
                  Wallet OR Bank Name:
                  <input
                    type="text"
                    name="wallet_Bank_name"
                    value={formData.wallet_Bank_name}
                    onChange={handleFormChange}
                    placeholder="Enter wallet or bank name"
                  />
                </label>
              </div>
              <div>
                <label>
                  Account Details:
                  <input
                    type="text"
                    name="accountDetails"
                    value={formData.accountDetails}
                    onChange={handleFormChange}
                    placeholder="Enter account details"
                  />
                </label>
              </div>
              <div>
                <label>
                  Reward Amount to Convert:
                  <input
                    type="number"
                    name="rewardAmount"
                    value={formData.rewardAmount}
                    onChange={handleFormChange}
                    placeholder="Enter amount"
                    max={rewards}
                  />
                </label>
              </div>
              <button type="submit">Submit Request</button>
            </form>
          )}
        </>
      )}

      {schedules.length === 0 ? (
        <p>No schedules found.</p>
      ) : (
        <>
          <h2>Schedules</h2>
          <ul>
            {schedules.map((schedule) => (
              <li key={schedule.schedule_id}>
                <p><strong>Date:</strong> {schedule.date}</p>
                <p><strong>Time:</strong> {schedule.time}</p>
                <p><strong>Status:</strong> {schedule.status}</p>
                {schedule.truckid && <p>Truck Assigned by Company: {schedule.licenseplate}</p>}
                {schedule.price && <p><strong>Price:</strong> {schedule.price}</p>}
                <button onClick={() => handleInitiateChat(schedule.company_id, schedule.user_id)}>
                  Contact Company
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default SchedulesList;
