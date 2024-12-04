import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentChat } from '../../../store/slices/currentChatSlice';
import Loader from '../ui/Loader';

const SchedulesList = () => {
  const userData = useSelector((state) => state.userData.value);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    accountType: '',
    accountDetails: '',
    rewardAmount: '',
    wallet_Bank_name: '',
  });
  const [activeRequest, setActiveRequest] = useState(null);
  const [rating, setRating] = useState(0);
  const navigate = useRouter();
  const dispatch = useDispatch();

  const user_id = userData.user_id;
  const rewards = userData.rewards;
  const conversionRate = 0.5; // 1 reward = 0.5 PKR
  const equivalentPKR = rewards * conversionRate;

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }; 

  const handleFormSubmit = async (e, schedule_id) => {
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
          wallet_Bank_name,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert('Transaction request created successfully!');
        setFormData({
          accountType: '',
          accountDetails: '',
          rewardAmount: '',
          wallet_Bank_name: '',
        });
        fetchActiveRequest()
      } else {
        alert(`Failed to create transaction request: ${result.message}`);
      }
    } catch (err) {
      console.error('Error creating transaction request:', err);
      alert('An error occurred while creating the transaction request.');
    }
  };
  const handleRating = async(e , schedule_id) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/schedule/rating_given_by_user' , {
        method : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({rating , schedule_id}),
      })
      const result = await response.json();
      if (response.ok) {
        alert('Schedule completed!');
        setSchedules(schedules.filter(schedule => schedule.schedule_id != schedule_id))
        
        //navigate.push('/profiles/userProfile') ;
        
      } else {
        alert("Failed to provide Rating");
      }      
    } catch (error) {
      console.error('Error initiating chat:', error);
      alert('An error occurred while Marking schedule as done');      
    }
    
    

  }

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

  const handleCancelRequest = async () => {
    try {
      const response = await fetch(`/api/rewards/cancel_request/${activeRequest.conversion_id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (response.ok) {
        setActiveRequest(null);
        alert('Your request has been canceled successfully!');
      } else {
        alert(`Failed to cancel the request: ${result.message}`);
      }
    } catch (err) {
      console.error('Error canceling the request:', err);
      alert('An error occurred while canceling the request.');
    }
  };

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
        fetchActiveRequest()
      } else {
        alert(`Failed to mark request as seen: ${result.message}`);
      }
    } catch (err) {
      console.error('Error marking request as seen:', err);
      alert('An error occurred while marking the request as seen.');
    }
  };
  const fetchActiveRequest = async () => {
    try {
      const response = await fetch(`/api/rewards/get_current_request/${userData.user_id}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      console.log('Active Request Data:', data); // Log the response to check structure
      if (data.success) {
        setActiveRequest(data.data); // Only set if success
      } else {
        console.log('No active request found.');
      }
    } catch (err) {
      console.error('Error fetching active request:', err);
    }
  };
  const fetchSchedules = async () => {
    try {
      const response = await fetch(`/api/schedule/get_schedule_for_user/${userData.user_id}`);
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
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate a 5-second delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Fetch data
        await fetchSchedules();
        await fetchActiveRequest();

        // Set data and loading state
        setData({ message: 'Data fetched successfully!' });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false); // Ensure loading state is reset even if there's an error
      }
    };

    fetchData();
  }, [userData]);
  
  console.log(activeRequest)
  if (loading) return<><Loader></Loader></>;

  return (
    <>

<div className="max-w-4xl mx-auto bg-white p-8 rounded-lg ">
  {/* Rewards Section */}
  <div className="mb-6">
    <h2 className="text-3xl font-bold text-black mb-2">Rewards Earned: {rewards}</h2>
    <h3 className="text-xl text-gray-700">Equivalent in PKR: {equivalentPKR} PKR</h3>
  </div>

  {/* Active Request Section */}
  {activeRequest && (activeRequest.status !== 'Rejected' && activeRequest.status !== 'Approved' && !activeRequest.isseen) ? (
    <div className="bg-yellow-100 p-6 rounded-lg mb-6">
      <p className="text-xl text-black mb-4">You already have a pending transaction request. Please wait for it to be processed before creating another.</p>
      <p className="font-semibold text-lg">Active request details</p>
      <p><strong>Account Type:</strong> {activeRequest.account_type}</p>
      <p><strong>{activeRequest.account_type === 'wallet' ? 'Wallet' : 'Bank'}:</strong> {activeRequest.wallet_bank_name}</p>
      <p><strong>Account details:</strong> {activeRequest.account_details}</p>
      <p><strong>Rewards to convert:</strong> {activeRequest.conversion_amount}</p>
      <p><strong>Equivalent PKR:</strong> {activeRequest.equivalent_pkr}</p>
      <button onClick={handleCancelRequest} className="bg-red-500 text-white py-2 px-4 rounded-lg mt-4 hover:bg-red-700 transition duration-300">
        Cancel Current Request
      </button>
    </div>
  ) : (
    <>
      {/* Approved or Rejected Request */}
      {activeRequest && (activeRequest.status === 'Approved' || activeRequest.status === 'Rejected') && (
        <div className="bg-blue-100 p-6 rounded-lg mb-6">
          <p className="text-xl text-black">
            Your request has been {activeRequest.status}.{' '}
            {!activeRequest.is_seen && <button onClick={handleMarkAsSeen} className="bg-green-500 text-white py-1 px-3 rounded-lg hover:bg-green-700 transition duration-300">Mark as Seen</button>}
          </p>
        </div>
      )}

      {/* Form to Convert Rewards */}
      <button onClick={() => setShowForm(!showForm)} className="bg-custom-green text-black py-2 px-4 rounded-lg mb-6 hover:bg-white transition duration-300">
        {showForm ? 'Cancel Conversion' : 'Convert Rewards into Account'}
      </button>

      {showForm && (
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-lg font-semibold text-gray-700">Account Type:</label>
            <select
              name="accountType"
              value={formData.accountType}
              onChange={handleFormChange}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Select</option>
              <option value="bank">Bank</option>
              <option value="wallet">Wallet</option>
            </select>
          </div>
          <div>
            <label className="block text-lg font-semibold text-gray-700">Wallet or Bank Name:</label>
            <input
              type="text"
              name="wallet_Bank_name"
              value={formData.wallet_Bank_name}
              onChange={handleFormChange}
              placeholder="Enter wallet or bank name"
              className="w-full p-3 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-lg font-semibold text-gray-700">Account Details:</label>
            <input
              type="text"
              name="accountDetails"
              value={formData.accountDetails}
              onChange={handleFormChange}
              placeholder="Enter account details"
              className="w-full p-3 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-lg font-semibold text-gray-700">Reward Amount to Convert:</label>
            <input
              type="number"
              name="rewardAmount"
              value={formData.rewardAmount}
              onChange={handleFormChange}
              placeholder="Enter amount"
              max={rewards}
              className="w-full p-3 border rounded-lg"
            />
          </div>
          <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded-lg mt-4 hover:bg-green-700 transition duration-300">
            Submit Request
          </button>
        </form>
      )}
    </>
  )}

  {/* Schedules Section */}
  {schedules.length === 0 ? (
    <p className="text-lg text-gray-700">No schedules found.</p>
  ) : (
    <>
      <h2 className="text-2xl font-bold text-black mb-4">Schedules</h2>
      <ul className="space-y-4">
        {schedules.map((schedule) => (
          <li key={schedule.schedule_id} className="p-4 border border-gray-200 rounded-lg">
            <p><strong>Date:</strong> {schedule.date}</p>
            <p><strong>Time:</strong> {schedule.time}</p>
            <p><strong>Status:</strong> {schedule.status}</p>
            {schedule.price && <p><strong>Price:</strong> {schedule.price}</p>}
            {schedule.status === 'RatingRequired' && (
              <form onSubmit={(e) => handleRating(e, schedule.schedule_id)} className="mt-4">
                <input
                  type="number"
                  step="0.1"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="p-2 border rounded-lg"
                />
                <button type="submit" className="bg-yellow-500 text-white py-1 px-4 rounded-lg ml-2 hover:bg-yellow-700 transition duration-300">
                  Submit Rating
                </button>
              </form>
            )}
            {schedule.truckid && <p><strong>Truck Assigned by Company:</strong> {schedule.licenseplate}</p>}
            <button onClick={() => handleInitiateChat(schedule.company_id, user_id)} className="bg-custom-green text-custom-black py-2 px-4 rounded-lg mt-2 hover:bg-white transition duration-300">
              Initiate Chat with Company
            </button>
          </li>
        ))}
      </ul>
    </>
  )}
</div>
</>
  );
};

export default SchedulesList;
