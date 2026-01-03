import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentChat } from '../../../store/slices/currentChatSlice';
import Loader from '../ui/Loader';
import NoDataDisplay from '../animations/NoDataDisplay';
import Alert from '../ui/Alert';

const SchedulesList = () => {
  const userData = useSelector((state) => state.userData.value);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
  const rewards = userData.rewards || 0;
  const conversionRate = 0.5;
  const equivalentPKR = rewards * conversionRate;

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const { accountType, accountDetails, rewardAmount, wallet_Bank_name } = formData;
    if (!accountType || !accountDetails || !rewardAmount || !wallet_Bank_name) {
      showAlert("warning", "Please fill in all fields");
      return;
    }

    if (formData.rewardAmount > rewards) {
      showAlert("warning", "You cannot convert more rewards than you have");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/rewards/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id,
          account_type: accountType,
          account_details: accountDetails,
          conversion_amount: rewardAmount,
          wallet_Bank_name,
        }),
      });

      await response.json();
      if (response.ok) {
        showAlert("success", "Conversion request submitted successfully!");
        setFormData({ accountType: '', accountDetails: '', rewardAmount: '', wallet_Bank_name: '' });
        setShowForm(false);
        fetchActiveRequest();
      } else {
        showAlert("error", "Failed to create conversion request");
      }
    } catch {
      showAlert("error", "An error occurred while creating the request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRating = async (e, schedule_id) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      showAlert("warning", "Please enter a rating between 1 and 5");
      return;
    }
    try {
      const response = await fetch('/api/schedule/rating_given_by_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, schedule_id }),
      });
      await response.json();
      if (response.ok) {
        showAlert("success", "Rating submitted successfully!");
        setSchedules(schedules.filter(schedule => schedule.schedule_id !== schedule_id));
        setRating(0);
      } else {
        showAlert("error", "Failed to submit rating");
      }
    } catch {
      showAlert("error", "An error occurred while submitting rating");
    }
  };

  const handleInitiateChat = async (companyId, userId) => {
    try {
      const response = await fetch('/api/chat/create_chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId, user_id: userId }),
      });
      const result = await response.json();
      if (response.ok) {
        dispatch(setCurrentChat(result.data.chat_id));
        showAlert("success", "Chat initiated successfully!");
        navigate.push('/chat');
      } else {
        showAlert("error", "Failed to initiate chat");
      }
    } catch {
      showAlert("error", "An error occurred while initiating chat");
    }
  };

  const handleCancelRequest = async () => {
    try {
      const response = await fetch(`/api/rewards/cancel_request/${activeRequest.conversion_id}`, {
        method: 'DELETE',
      });
      await response.json();
      if (response.ok) {
        setActiveRequest(null);
        showAlert("success", "Request cancelled successfully!");
      } else {
        showAlert("error", "Failed to cancel request");
      }
    } catch {
      showAlert("error", "An error occurred while cancelling request");
    }
  };

  const handleMarkAsSeen = async () => {
    try {
      const response = await fetch(`/api/rewards/mark_as_seen/${activeRequest.conversion_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      await response.json();
      if (response.ok) {
        showAlert("success", "Request marked as seen");
        fetchActiveRequest();
      } else {
        showAlert("error", "Failed to mark as seen");
      }
    } catch {
      showAlert("error", "An error occurred");
    }
  };

  const fetchActiveRequest = async () => {
    try {
      const response = await fetch(`/api/rewards/get_current_request/${userData.user_id}`);
      if (!response.ok) return;
      const data = await response.json();
      if (data.success) {
        setActiveRequest(data.data);
      }
    } catch {
      console.error('Error fetching active request');
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await fetch(`/api/schedule/get_schedule_for_user/${userData.user_id}`);
      if (!response.ok) return;
      const data = await response.json();
      setSchedules(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchSchedules();
      await fetchActiveRequest();
      setLoading(false);
    };
    fetchData();
  }, [userData]);

  const getStatusBadge = (status) => {
    const styles = {
      'Pending': 'bg-amber-100 text-amber-700',
      'Confirmed': 'bg-blue-100 text-blue-700',
      'RatingRequired': 'bg-purple-100 text-purple-700',
      'Completed': 'bg-emerald-100 text-emerald-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-600';
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {alert.map((a) => (
        <Alert
          key={a.id}
          type={a.type}
          message={a.message}
          onClose={() => setAlert((alerts) => alerts.filter((al) => al.id !== a.id))}
        />
      ))}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Schedules</h1>
        <p className="text-gray-500 mt-1">View your waste pickup schedules and manage rewards</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Rewards</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{rewards}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Equivalent: Rs. {equivalentPKR}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Active Schedules</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{schedules.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending Ratings</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {schedules.filter(s => s.status === 'RatingRequired').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Rewards Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Reward Conversion</h2>
              <p className="text-sm text-gray-500">Convert your rewards to cash</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {activeRequest ? (
            <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Active Conversion Request</h3>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                      activeRequest.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                      activeRequest.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {activeRequest.status}
                    </span>
                  </div>
                </div>
                {activeRequest.status === "Pending" && (
                  <button
                    onClick={handleCancelRequest}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Account Type</p>
                  <p className="font-medium text-gray-800 capitalize">{activeRequest.account_type}</p>
                </div>
                <div>
                  <p className="text-gray-500">{activeRequest.account_type === "wallet" ? "Wallet" : "Bank"}</p>
                  <p className="font-medium text-gray-800">{activeRequest.wallet_bank_name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Account Details</p>
                  <p className="font-medium text-gray-800">{activeRequest.account_details}</p>
                </div>
                <div>
                  <p className="text-gray-500">Rewards to Convert</p>
                  <p className="font-medium text-gray-800">{activeRequest.conversion_amount}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Equivalent PKR</p>
                  <p className="font-bold text-emerald-600 text-lg">Rs. {activeRequest.equivalent_pkr}</p>
                </div>
              </div>

              {activeRequest.status === "Approved" && !activeRequest.is_seen && (
                <button
                  onClick={handleMarkAsSeen}
                  className="mt-4 w-full py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                >
                  Mark as Seen
                </button>
              )}
            </div>
          ) : (
            <div>
              {!showForm ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Convert Rewards to Cash
                </button>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                      <select
                        name="accountType"
                        value={formData.accountType}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="">Select Type</option>
                        <option value="bank">Bank Account</option>
                        <option value="wallet">Mobile Wallet</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {formData.accountType === 'wallet' ? 'Wallet Name' : 'Bank Name'}
                      </label>
                      <input
                        type="text"
                        name="wallet_Bank_name"
                        value={formData.wallet_Bank_name}
                        onChange={handleFormChange}
                        placeholder={formData.accountType === 'wallet' ? 'e.g. JazzCash, Easypaisa' : 'e.g. HBL, UBL'}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                      <input
                        type="text"
                        name="accountDetails"
                        value={formData.accountDetails}
                        onChange={handleFormChange}
                        placeholder="Enter account/mobile number"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rewards to Convert (Max: {rewards})
                      </label>
                      <input
                        type="number"
                        name="rewardAmount"
                        value={formData.rewardAmount}
                        onChange={handleFormChange}
                        max={rewards}
                        placeholder="Enter amount"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Submitting...
                        </>
                      ) : 'Submit Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Schedules Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Pickup Schedules</h2>
              <p className="text-sm text-gray-500">Your upcoming and pending pickups</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {schedules.length === 0 ? (
            <NoDataDisplay emptyText="No schedules found" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schedules.map((schedule) => (
                <div
                  key={schedule.schedule_id}
                  className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-5 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(schedule.status)}`}>
                      {schedule.status}
                    </span>
                    <button
                      onClick={() => handleInitiateChat(schedule.company_id, user_id)}
                      className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-600">{new Date(schedule.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-600">{schedule.time}</span>
                    </div>
                    {schedule.price && (
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium text-emerald-600">Rs. {schedule.price}</span>
                      </div>
                    )}
                    {schedule.truckid && (
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        <span className="text-gray-600">{schedule.licenseplate}</span>
                      </div>
                    )}
                  </div>

                  {schedule.status === 'RatingRequired' && (
                    <form onSubmit={(e) => handleRating(e, schedule.schedule_id)} className="mt-4 pt-4 border-t border-gray-100">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rate this service</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.1"
                          min="1"
                          max="5"
                          value={rating}
                          onChange={(e) => setRating(e.target.value)}
                          placeholder="1-5"
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
                        >
                          Submit
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchedulesList;
