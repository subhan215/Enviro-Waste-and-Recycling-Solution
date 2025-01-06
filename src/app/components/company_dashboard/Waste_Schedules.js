"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentChat } from "../../../store/slices/currentChatSlice";
//import { Modal, Button } from "react-bootstrap";
//import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import Loader from "../ui/Loader";
import NoDataDisplay from "../animations/NoDataDisplay";
import Alert from '../ui/Alert'


const Waste_Schedules = ({}) => {
  const [schedules, setSchedules] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [loading, setLoading] = useState(true);
  //const [error, setError] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const navigate = useRouter();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.userData.value);
  const [showForm, setShowForm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [weights, setWeights] = useState({});
  const [wastePrices, setWastePrices] = useState([]);
  const [Rating, setRating] = useState();
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
    const fetchCompanyRating = async () => {
      try {
        const response = await axios.get(
          `/api/schedule/get_company_rating/${companyId}`
        );
        console.log("Company rating : ", response);
        setRating(response.data.data);
      } catch (err){
        console.log('error' , err)
        //console.log("Error fetching company rating:", error);
        showAlert('error' , 'Error fetching company rating')
      }
    };

    const fetchCompanySchedules = async () => {
      try {
        const response = await fetch(
          `/api/schedule/get_schedules_for_company/${companyId}`
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setSchedules(data);
      } catch (error){
        console.log(error)
        //setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchCompanyTrucks = async () => {
      try {
        const response = await fetch(
          `/api/trucks/get_Trucks_Information/${companyId}`
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        setTrucks(data.data);
      } catch (error){
        console.log(error)
        //setError(err.message);
      }
    };

    const fetchWastePrices = async () => {
      try {
        const response = await axios.get("/api/requests/get_waste_price");
        setWastePrices(response.data.data);
      } catch (error) {
        //alert("Error while fetching waste prices: ", error);
        showAlert('error' , 'Error while fetching waste prices')
        console.log(error);
      }
    };

    // Delay the fetch functions by 1 second
    const delayFetches = () => {
      setTimeout(() => {
        fetchCompanyRating();
        fetchWastePrices();
        fetchCompanySchedules();
        fetchCompanyTrucks();
      }, 1000);
    };

    delayFetches();
  }, [companyId]);

  const handleAssignTruck = async (scheduleId) => {
    if (!selectedTruck) {
      //alert("Please select a truck to assign.");
      showAlert('info' , 'Please select a truck to assign')
      return;
    }

    setAssigning(true);

    try {
      const response = await fetch("/api/schedule/assign_truck", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          schedule_id: scheduleId,
          truck_id: selectedTruck,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        //alert("Truck assigned successfully!");
        showAlert('success' , 'Truck assigned successfully!');
        setSchedules((prevSchedules) =>
          prevSchedules.map((schedule) =>
            schedule.schedule_id == result.schedule.schedule_id
              ? result.schedule
              : schedule
          )
        );
      } else {
        //alert(`Failed to assign truck: ${result.message}`);
        showAlert('error' , 'Failed to assign truck');
      }
    } catch (err) {
      console.error("Error assigning truck:", err);
      //alert("An error occurred while assigning the truck.");
      showAlert('error' , 'Error assigning truck');
      
    } finally {
      setAssigning(false);
    }
  };

  const handleInitiateChat = async (company_id, userId) => {
    try {
      const response = await fetch("/api/chat/create_chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ company_id, user_id: userId }),
      });
      const result = await response.json();
      if (response.ok) {
        dispatch(setCurrentChat(result.data.chat_id));
        //alert("Chat initiated successfully!");
        showAlert('success' , 'Chat initiated successfully!')
        navigate.push("/chat");
      } else {
        //alert(`Failed to initiate chat: ${result.message}`);
        showAlert('error' , 'Failed to initiate chat')
      }
    } catch (err) {
      console.error("Error initiating chat:", err);
      //alert("An error occurred while initiating the chat.");
      showAlert('error' , 'An error occurred while initiating the chat')
      
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
      const response = await axios.post("/api/schedule/mark_as_done", {
        schedule_id: selectedSchedule,
        weights: weightsData,
      });
      if (response.status === 200) {
        //alert("Schedule marked as done successfully!");
        showAlert('success' , 'Schedule marked as done successfully!')
        setShowForm(false);
        setSelectedSchedule(null);
        const { updatedSchedule } = response.data;
        setSchedules((prevSchedules) =>
          prevSchedules.map((schedule) =>
            schedule.schedule_id == updatedSchedule.schedule_id
              ? updatedSchedule
              : schedule
          )
        );
      }
    } catch (error) {
      console.error("Error marking schedule as done:", error);
      //alert("An error occurred while marking the schedule as done.");
      showAlert('error' , 'An error occurred while marking the schedule as done.');
    }
  };

  if (loading) return<><Loader></Loader></>;
  if (schedules.length === 0)
    return (
      <>
      {alert.map((alert) => (
        <Alert
          key={alert.id}
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert((alert) => alert.filter((a) => a.id !== alert.id))}
        />
      ))}        
        <div className="flex items-center gap-2">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6"
            style={{ fill: "#FFAA00", marginRight: "8px" }} // Adjust the margin as needed
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-1.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
            />
          </svg>
          <span className=" font-semibold">{Rating}</span>
        </div>
        <NoDataDisplay emptyText="No schedules Found!" />
      </>
    );
    
  return (
    <div>
    <h1 className="text-xl sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2 text-custom-black">
      Company Schedules
    </h1>
    {alert.map((alert) => (
      <Alert
        key={alert.id}
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert((alert) => alert.filter((a) => a.id !== alert.id))}
      />
    ))}
    <div className="p-6 rounded-lg">
      <div style={{ display: "flex" }} className="mb-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-6"
          style={{ fill: "#FFAA00", marginRight: "8px" }} // Adjust the margin as needed
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-1.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
          />
        </svg>
        <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold">
          &nbsp;{Rating}
        </span>
      </div>
  
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
        {schedules.map((schedule) =>
          schedule.status !== "done" ? (
            <div
              key={schedule.schedule_id}
              className="relative p-6 bg-white border border-gray-200 rounded-lg shadow-lg"
            >
              <button
                onClick={() =>
                  handleInitiateChat(schedule.company_id, schedule.user_id)
                }
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5 text-black"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97ZM6.75 8.25a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H7.5Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
  
              <div className="space-y-3 mb-6">
                <p className="text-sm sm:text-sm md:text-base font-semibold">
                  <strong>Date:</strong> {`${new Date(schedule.date).getMonth() + 1}/${new Date(schedule.date).getDate()}/${new Date(schedule.date).getFullYear()}`}
                </p>
                <p className="text-sm sm:text-sm md:text-base font-semibold">
                  <strong>Time:</strong> {schedule.time}
                </p>
                <p className="text-sm sm:text-sm md:text-base font-semibold">
                  <strong>Status:</strong> {schedule.status}
                </p>
                <p className="text-sm sm:text-sm md:text-base font-semibold">
                  <strong>Truck Assigned:</strong> {schedule.licenseplate || "None"}
                </p>
              </div>
  
              {schedule.status === "Scheduled" && !schedule.truckid && (
                <div className="mt-6 p-6 rounded-lg">
                  <label className="block mb-4 text-sm sm:text-base font-medium text-custom-black">
                    Select Truck:
                    <select
                      value={selectedTruck}
                      onChange={(e) => setSelectedTruck(e.target.value)}
                      className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="" className="text-custom-black">Choose a truck</option>
                      {trucks.map((truck) => (
                        <option key={truck.truckid} value={truck.truckid} className="text-custom-blak">
                          {truck.licenseplate}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    onClick={() => handleAssignTruck(schedule.schedule_id)}
                    disabled={assigning}
                    className={`w-full px-6 py-3 text-custom-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      assigning
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-custom-green hover:bg-green-600 focus:ring-custom-green border border-custom-black"
                    }`}
                  >
                    {assigning ? "Assigning..." : "Assign Truck"}
                  </button>
                </div>
              )}
  
              {schedule.truckid && (
                <button
                  onClick={() => {
                    handleMarkAsDone(schedule.schedule_id);
                  }}
                  className="w-full px-6 py-3 bg-custom-green text-cusiom-black border border-custom-black hover:bg-green-600 hover:text-white focus:ring-custom-green rounded-lg"
                >
                  Mark as Done
                </button>
              )}
            </div>
          ) : null
        )}
      </div>
      {showForm && (
        <form
          onSubmit={handleFormSubmit}
          className="mt-6 p-6 bg-gray-100 border border-gray-300 rounded-lg"
        >
          <h3 className="text-xl sm:text-lg md:text-xl font-semibold mb-4">
            Enter received weights
          </h3>
          {wastePrices.map((item) => (
            <div key={item.name} className="mb-4">
              <label className="block mb-1 font-medium text-custom-black">
                {item.name} ({item.rate_per_kg} per kg):
              </label>
              <input
                type="number"
                value={weights[item.name] || ""}
                onChange={(e) =>
                  setWeights({ ...weights, [item.name]: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-custom-black text-custom-black"
              />
            </div>
          ))}
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-custom-green text-cusiom-black border border-custom-black hover:bg-green-600 hover:text-white focus:ring-custom-green rounded-lg text-custom-black"
          >
            Submit
          </button>
        </form>
      )}
    </div>
  </div>
  
  );
};

export default Waste_Schedules;
