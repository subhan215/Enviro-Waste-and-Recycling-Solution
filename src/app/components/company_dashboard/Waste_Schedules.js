"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentChat } from "../../../store/slices/currentChatSlice";
import axios from "axios";
import Loader from "../ui/Loader";
import NoDataDisplay from "../animations/NoDataDisplay";
import Alert from '../ui/Alert';

const Waste_Schedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [selectedTruck, setSelectedTruck] = useState({});
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null);
  const navigate = useRouter();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.userData.value);
  const [showForm, setShowForm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [weights, setWeights] = useState({});
  const [wastePrices, setWastePrices] = useState([]);
  const [Rating, setRating] = useState(0);
  const [submittingWeights, setSubmittingWeights] = useState(false);
  const [alert, setAlert] = useState([]);

  const showAlert = (type, message) => {
    const id = Date.now();
    setAlert([...alert, { id, type, message }]);
    setTimeout(() => {
      setAlert((alerts) => alerts.filter((alert) => alert.id !== id));
    }, 4000);
  };

  let companyId = userData.user_id;

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ratingRes, pricesRes, schedulesRes, trucksRes] = await Promise.all([
          axios.get(`/api/schedule/get_company_rating/${companyId}`),
          axios.get("/api/requests/get_waste_price"),
          fetch(`/api/schedule/get_schedules_for_company/${companyId}`),
          fetch(`/api/trucks/get_Trucks_Information/${companyId}`)
        ]);

        setRating(ratingRes.data.data || 0);
        setWastePrices(pricesRes.data.data || []);

        if (schedulesRes.ok) {
          const schedulesData = await schedulesRes.json();
          setSchedules(schedulesData);
        }

        if (trucksRes.ok) {
          const trucksData = await trucksRes.json();
          setTrucks(trucksData.data || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    };

    fetchAll();
  }, [companyId]);

  const handleAssignTruck = async (scheduleId) => {
    if (!selectedTruck[scheduleId]) {
      showAlert('info', 'Please select a truck to assign');
      return;
    }

    setAssigning(scheduleId);
    try {
      const response = await fetch("/api/schedule/assign_truck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schedule_id: scheduleId,
          truck_id: selectedTruck[scheduleId],
        }),
      });

      const result = await response.json();
      if (response.ok) {
        showAlert('success', 'Truck assigned successfully!');
        setSchedules((prev) =>
          prev.map((s) => s.schedule_id == result.schedule.schedule_id ? result.schedule : s)
        );
      } else {
        showAlert('error', 'Failed to assign truck');
      }
    } catch (err) {
      console.error("Error assigning truck:", err);
      showAlert('error', 'Error assigning truck');
    } finally {
      setAssigning(null);
    }
  };

  const handleInitiateChat = async (company_id, userId) => {
    try {
      const response = await fetch("/api/chat/create_chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id, user_id: userId }),
      });
      const result = await response.json();
      if (response.ok) {
        dispatch(setCurrentChat(result.data.chat_id));
        showAlert('success', 'Chat initiated successfully!');
        navigate.push("/chat");
      } else {
        showAlert('error', 'Failed to initiate chat');
      }
    } catch (err) {
      console.error("Error initiating chat:", err);
      showAlert('error', 'An error occurred while initiating the chat');
    }
  };

  const handleMarkAsDone = (scheduleId) => {
    setSelectedSchedule(scheduleId);
    setShowForm(true);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setSubmittingWeights(true);
    const weightsData = wastePrices.map((item) => ({
      name: item.name,
      rate_per_kg: item.rate_per_kg,
      weight: weights[item.name] || 0,
    }));

    try {
      const response = await axios.post("/api/schedule/mark_as_done", {
        schedule_id: selectedSchedule,
        weights: weightsData,
      });
      if (response.status === 200) {
        showAlert('success', 'Schedule marked as done successfully!');
        setShowForm(false);
        setSelectedSchedule(null);
        setWeights({});
        const { updatedSchedule } = response.data;
        setSchedules((prev) =>
          prev.map((s) => s.schedule_id == updatedSchedule.schedule_id ? updatedSchedule : s)
        );
      }
    } catch (error) {
      console.error("Error marking schedule as done:", error);
      showAlert('error', 'An error occurred while marking the schedule as done');
    } finally {
      setSubmittingWeights(false);
    }
  };

  const activeSchedules = schedules.filter(s => s.status !== 'done');
  const pendingTruck = activeSchedules.filter(s => s.status === 'Scheduled' && !s.truckid).length;

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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Waste Schedules</h1>
        <p className="text-gray-500 mt-1">Manage pickup schedules and assign trucks</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Your Rating</p>
              <div className="flex items-center gap-1 mt-1">
                <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <span className="text-2xl font-bold text-gray-800">{Rating || 'N/A'}</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-500 fill-current" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Active Schedules</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{activeSchedules.length}</p>
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
              <p className="text-sm text-gray-500 font-medium">Needs Truck</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{pendingTruck}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Available Trucks</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{trucks.length}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Schedules List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Scheduled Pickups</h2>
              <p className="text-sm text-gray-500">Assign trucks and mark pickups as complete</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {activeSchedules.length === 0 ? (
            <div className="py-8">
              <NoDataDisplay emptyText="No schedules found" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeSchedules.map((schedule) => (
                <div
                  key={schedule.schedule_id}
                  className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-5 hover:shadow-lg transition-all duration-300"
                >
                  {/* Schedule Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {`${new Date(schedule.date).getMonth() + 1}/${new Date(schedule.date).getDate()}/${new Date(schedule.date).getFullYear()}`}
                        </p>
                        <p className="text-sm text-gray-500">{schedule.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        schedule.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                        schedule.status === 'In Progress' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {schedule.status}
                      </span>
                      <button
                        onClick={() => handleInitiateChat(schedule.company_id, schedule.user_id)}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
                        title="Chat with user"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Truck Info */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      <span className="text-gray-600">
                        Truck: {schedule.licenseplate || <span className="text-orange-500">Not assigned</span>}
                      </span>
                    </div>
                  </div>

                  {/* Assign Truck Section */}
                  {schedule.status === "Scheduled" && !schedule.truckid && (
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div className="relative">
                        <select
                          value={selectedTruck[schedule.schedule_id] || ''}
                          onChange={(e) => setSelectedTruck(prev => ({
                            ...prev,
                            [schedule.schedule_id]: e.target.value
                          }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
                        >
                          <option value="">Select a truck</option>
                          {trucks.map((truck) => (
                            <option key={truck.truckid} value={truck.truckid}>
                              {truck.licenseplate}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAssignTruck(schedule.schedule_id)}
                        disabled={assigning === schedule.schedule_id}
                        className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {assigning === schedule.schedule_id ? (
                          <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Assigning...
                          </>
                        ) : 'Assign Truck'}
                      </button>
                    </div>
                  )}

                  {/* Mark as Done Button */}
                  {schedule.truckid && (
                    <button
                      onClick={() => handleMarkAsDone(schedule.schedule_id)}
                      className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Mark as Done
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Weights Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Enter Weights</h3>
                    <p className="text-emerald-100 text-sm">Record collected materials</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowForm(false); setSelectedSchedule(null); }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {wastePrices.map((item) => (
                <div key={item.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {item.name} <span className="text-gray-400">(Rs. {item.rate_per_kg}/kg)</span>
                  </label>
                  <input
                    type="number"
                    value={weights[item.name] || ""}
                    onChange={(e) => setWeights({ ...weights, [item.name]: e.target.value })}
                    placeholder="Enter weight in kg"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setSelectedSchedule(null); }}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWeights}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submittingWeights ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting...
                    </>
                  ) : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Waste_Schedules;
