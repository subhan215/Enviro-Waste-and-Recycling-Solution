import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentChat } from '../../../store/slices/currentChatSlice';
import Loader from '../ui/Loader';
import NoDataDisplay from '../animations/NoDataDisplay';
import { FaComment } from 'react-icons/fa';
import Alert from '../ui/Alert'



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
  const [alert, setAlert] = useState([]);
  const showAlert = (type, message) => {
    const id = Date.now();
    setAlert([...alert, { id, type, message }]);
    setTimeout(() => {
      setAlert((alerts) => alerts.filter((alert) => alert.id !== id));
    }, 4000);
  };  
  
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
    if (!accountType || !accountDetails || !rewardAmount || !wallet_Bank_name) {
      //alert('Please fill in all fields.');
      showAlert("info" , "Please fill in all fields")
      return;
    }
    //alert("Reward Amount: " + rewardAmount); 
    showAlert("info" , `Reward Amount : ${rewardAmount}`)
    
    if (formData.rewardAmount > rewards) {
      //alert('You cannot convert more rewards than you have.');
    showAlert("warning" , 'You cannot convert more rewards than you have')
      
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
        //alert('Transaction request created successfully!');
        showAlert("success" , "Transaction request created successfully!")
        setFormData({
          accountType: '',
          accountDetails: '',
          rewardAmount: '',
          wallet_Bank_name: '',
        });
        fetchActiveRequest()
      } else {
        //alert(`Failed to create transaction request: ${result.message}`);
        showAlert("error" , "Failed to create transaction request")
      }
    } catch (err) {
      //console.error('Error creating transaction request:', err);
      //alert('An error occurred while creating the transaction request.');
      showAlert("error" , "An error occurred while creating the transaction request")
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
        //alert('Schedule completed!');
        showAlert("success" , "Schedule completed!")
        setSchedules(schedules.filter(schedule => schedule.schedule_id != schedule_id))
        
        //navigate.push('/profiles/userProfile') ;
        
      } else {
        //alert("Failed to provide Rating");
        showAlert("error" , "Failed to provide Rating")
        
      }      
    } catch (error) {
      //console.error('Error initiating chat:', error);
      //alert('An error occurred while Marking schedule as done');      
      showAlert("error" , "An error occurred while Marking schedule as done")
      
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
        //alert('Chat initiated successfully!');
        showAlert("success" , "Chat initiated successfully!")
        navigate.push('/chat');
      } else {
        //alert(`Failed to initiate chat: ${result.message}`);
        showAlert("error" , "Failed to initiate chat" )
      }
    } catch (err) {
      //console.error('Error initiating chat:', err);
      //alert('An error occurred while initiating the chat.');
      showAlert("error" , "An error occurred while initiating the chat")
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
        //alert('Your request has been canceled successfully!');
        showAlert('successfully' , "An error occurred while initiating the chat")
      } else {
        //alert(`Failed to cancel the request: ${result.message}`);
        showAlert("error" , "Failed to cancel the request")
      }
    } catch (err) {
      //console.error('Error canceling the request:', err);
      //alert('An error occurred while canceling the request.');
      showAlert("error" , "An error occurred while canceling the request")
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
        //alert('Request marked as seen.');
        showAlert("success" , "Request marked as seen")
        fetchActiveRequest()
      } else {
        //alert(`Failed to mark request as seen: ${result.message}`);
        showAlert("error" , "Failed to mark request as seen" )
      }
    } catch (err) {
      //console.error('Error marking request as seen:', err);
      //alert('An error occurred while marking the request as seen.');
      showAlert("An error occurred while marking the request as seen")
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
        //console.log('No active request found.');
        showAlert("info" , "No active request found")
      }
    } catch (err) {
      //console.error('Error fetching active request:', err);
      showAlert("error" , "Error fetching active request")
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
      console.log("Sch : ", data)
    } catch (err) {
      setError(err.message);
    }
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Start loading
        setLoading(true);
  
        // Simulate a 5-second delay
        await new Promise(resolve => setTimeout(resolve, 1000));
  
        // Fetch data
        await fetchSchedules();
        await fetchActiveRequest();
  
        // Set data and loading state after fetching is done
        setData({ message: 'Data fetched successfully!' });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        // Set loading to false once data is fetched or an error occurs
        setLoading(false);
      }
    };
  
    fetchData();
  }, [userData]);
  console.log(activeRequest)
  if (loading) return<><Loader></Loader></>;

  return (
    <>
<div className="w-full mx-auto p-6 sm:p-4 md:p-6 rounded-lg">
  {alert.map((alert) => (
    <Alert
      key={alert.id}
      type={alert.type}
      message={alert.message}
      onClose={() => setAlert((alert) => alert.filter((a) => a.id !== alert.id))}
    />
  ))}

  {/* Rewards Section */}
  <div className="mb-8 text-center">
    <h2 className="sm:text-2xl md:text-3xl font-bold text-black mb-2">
      Rewards Earned: {rewards}
    </h2>
    <h3 className="sm:text-base md:text-xl text-gray-600">
      Equivalent in PKR: {equivalentPKR} PKR
    </h3>
  </div>

  {/* Active Request Section */}
  {activeRequest ? (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="relative col-span-1 bg-white p-6 sm:p-4 rounded-lg shadow-md">
        {activeRequest.status === "Pending" && (
          <button
            onClick={handleCancelRequest}
            className="absolute top-2 right-2 md:text-2xl sm:text-xl text-red-500 hover:text-red-700 transition duration-300"
            aria-label="Cancel Current Request"
          >
            &times;
          </button>
        )}

        <h3 className="sm:text-md md:text-xl font-bold text-black mb-4">
          Active Request Details
        </h3>
        <p>
          <strong>Account Type:</strong> {activeRequest.account_type}
        </p>
        <p>
          <strong>
            {activeRequest.account_type === "wallet" ? "Wallet" : "Bank"}:
          </strong>{" "}
          {activeRequest.wallet_bank_name}
        </p>
        <p>
          <strong>Account Details:</strong> {activeRequest.account_details}
        </p>
        <p>
          <strong>Rewards to Convert:</strong> {activeRequest.conversion_amount}
        </p>
        <p>
          <strong>Equivalent PKR:</strong> {activeRequest.equivalent_pkr}
        </p>
        {/* Conditional Rendering for Request Status */}
        {activeRequest.status === "Approved" && (
          <div className="mt-4">
            <p className="md:text-base sm:text-sm font-semibold text-green-600">
              Request Approved
            </p>
            {!activeRequest.is_seen && (
              <button
                onClick={handleMarkAsSeen}
                className="mt-2 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300"
              >
                Mark as Seen
              </button>
            )}
          </div>
        )}
        {activeRequest.status === "Rejected" && (
          <div className="mt-4">
            <p className="md:text-base sm:text-sm font-semibold text-red-600">
              Request Rejected
            </p>
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="mb-8 w-full">
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full bg-custom-green text-black py-3 px-6 rounded-lg hover:bg-white transition duration-300"
      >
        {showForm ? "Cancel Conversion" : "Convert Rewards into Account"}
      </button>

      {showForm && (
        <form
          onSubmit={handleFormSubmit}
          className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          <div>
            <label className="block md:text-lg sm:text-base font-semibold text-gray-700 mb-2">
              Account Type
            </label>
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
            <label className="block md:text-lg sm:text-base font-semibold text-gray-700 mb-2">
              Wallet or Bank Name
            </label>
            <input
              type="text"
              name="wallet_Bank_name"
              value={formData.wallet_Bank_name}
              onChange={handleFormChange}
              placeholder="Enter wallet or bank name"
              className="w-full p-3 border rounded-lg"
            />
          </div>
          {/* Additional Form Fields */}
          <div>
            <label className="block md:text-lg sm:text-base font-semibold text-gray-700 mb-2">
              Account Details
            </label>
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
            <label className="block md:text-lg sm:text-base font-semibold text-gray-700 mb-2">
              Reward Amount to Convert
            </label>
            <input
              type="number"
              name="rewardAmount"
              value={formData.rewardAmount}
              onChange={(e) =>
                setFormData({ ...formData, rewardAmount: e.target.value })
              }
              placeholder="Enter amount"
              max={rewards}
              className="w-full p-3 border rounded-lg"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <button
              type="submit"
              className="w-full bg-custom-green text-white py-3 px-6 rounded-lg hover:bg-custom-green-700 transition duration-300"
            >
              Submit Request
            </button>
          </div>
        </form>
      )}
    </div>
  )}

  {/* Schedules Section */}
  <div>
    <h2 className="sm:text-xl md:text-2xl font-bold text-black mb-6">
      Schedules
    </h2>
    {schedules.length === 0 ? (
      <NoDataDisplay emptyText="No Schedules Found" />
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {schedules.map((schedule) => (
          <div
            key={schedule.schedule_id}
            className="p-6 sm:p-4 bg-white border border-custom-green rounded-lg shadow hover:shadow-md transition duration-200"
          >
            {/* Schedule Information */}
            <p className="md:text-lg sm:text-md font-semibold mb-2">
              Date:{" "}
              {`${new Date(schedule.date).toLocaleDateString()}`}
            </p>
            <p>
              <strong>Time:</strong> {schedule.time}
            </p>
            <p>
              <strong>Status:</strong> {schedule.status}
            </p>
          </div>
        ))}
      </div>
    )}
  </div>
</div>

</>
  );
};

export default SchedulesList;
