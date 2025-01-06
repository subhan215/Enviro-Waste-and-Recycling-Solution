import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Loader from '../ui/Loader';
import NoDataDisplay from "../../components/animations/NoDataDisplay"
import Alert from '../ui/Alert'

const ManageAndViewAreas = () => {
  const [areas, setAreas] = useState([]);
  const [nonAssignedAreas, setNonAssignedAreas] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);
 // const [isAddingArea, setIsAddingArea] = useState(false);
  const [viewMode, setViewMode] = useState(true); // true for viewing, false for managing
  const userData = useSelector((state) => state.userData.value);
  const [areaRequests , setAreaRequests] = useState([])
  const [loading, setLoading] = useState(true) ; 
  const [alert, setAlert] = useState([]);


  let companyId = userData.user_id;

  const showAlert = (type, message) => {
    const id = Date.now();
    setAlert([...alert, { id, type, message }]);
    setTimeout(() => {
      setAlert((alerts) => alerts.filter((alert) => alert.id !== id));
    }, 4000);
  };

  const fetchAreas = async () => {
    try {
      const response = await fetch(`/api/area/get_all_assigned_areas/${companyId}`);
      const data = await response.json();
      if (data.success) {
        console.log(data)
        setAreas(data.data); // Assuming response contains "assigned" and "non_assigned"
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  };
  const fetchNonAssignedAreas = async () => {
    try {
      const response = await fetch("/api/area/get_all_non_served_areas");
      const data = await response.json();
      setNonAssignedAreas(data.data); // Assuming the API returns an array of areas
    } catch (error) {
      console.error("Error fetching non-assigned areas:", error);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      // Simulating a 1-second delay before fetching data
      setTimeout(async () => {
        await fetchNonAssignedAreas();
        await fetchAreas();
        setLoading(false);  // Set loading to false after data is fetched
      }, 1000); // 1 second delay
    };

    fetchData();
  }, []); // Fetch areas on component mount

  /*const handleAddAreaClick = () => {
    setIsAddingArea(true);  // Open the area selection form
  }; */

  const handleAreaSelect = (e) => {
    const areaId = parseInt(e.target.value);
    setSelectedAreas((prevSelectedAreas) =>
      prevSelectedAreas.includes(areaId)
        ? prevSelectedAreas.filter((id) => id !== areaId) // Deselect area
        : [...prevSelectedAreas, areaId] // Select new area
    );
  };

  const handleAssignArea = async () => {
    if (selectedAreas.length > 0) {
      try {
        const response = await fetch(`/api/area/assign_areas_to_company`, {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ selectedAreas, company_id: companyId }),
        });

        const responseData = await response.json();
        if (responseData.success) {
          //alert("Assigned areas to company!");
          showAlert("success", "Assigned areas to company!");
          
          fetchAreas(); // Re-fetch areas after assignment
          //setIsAddingArea(false);
          setSelectedAreas([]); // Clear the selected areas after assigning
          setViewMode(true) ; 
          setNonAssignedAreas([])
        } else {
          //alert(responseData.message);
          showAlert("error", responseData.message);
          
        }
      } catch (error) {
        //alert(error.message);
        showAlert("error", error.message);
        
      }
    }
  };
  const fetchAreaRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/area/get_area_for_request_approval/${companyId}`);
      const data = await response.json();
      console.log(data)
      if (data.success) {
        setAreaRequests(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to fetch area requests.");
      console.error("Error fetching area requests:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return<><Loader></Loader></>;
  return (
    <div className="p-6 min-h-screen relative">
  <div className="rounded p-6">
    <h2 className="text-2xl font-bold mb-4">Manage and View Areas</h2>

    {alert.map((alert) => (
      <Alert
        key={alert.id}
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert((alert) => alert.filter((a) => a.id !== alert.id))}
      />
    ))}

   {/* Floating Action Buttons */}
<div className="fixed bottom-6 right-4 flex flex-col space-y-2 ">
  {/* Add New Area */}
  <button
    className="h-10 w-12 text-xs md:w-16 md:h-16 sm:w-12 sm:h-10 md:text-sm sm:text-xs bg-custom-green text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition"
    onClick={() => setViewMode((prev) => !prev)}
    title={viewMode ? "Add New Area" : "View Assigned Areas"}
  >
    {viewMode ? (
      <span className="material-icons">add</span>
    ) : (
      <span className="material-icons">view_list</span>
    )}
  </button>

  {/* Fetch Area Requests */}
  <button
    className="h-10 w-12 text-xs md:w-16 md:h-16 sm:w-12 sm:h-10 md:text-sm sm:text-xs bg-custom-green text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition"
    onClick={fetchAreaRequests}
    title="Fetch Area Requests"
  >
    <span className="material-icons">refresh</span>
  </button>
</div>


    {/* Fetch Area Requests Section */}
    <div className="mb-8 mt-4">
      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : areaRequests.length === 0 ? (
        <NoDataDisplay emptyText="No requests Fetched" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {areaRequests.map((req, index) => (
            <div
              key={index}
              className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300"
            >
              <p className="font-semibold text-custom-black">Request {index + 1}</p>
              <p className="text-sm text-custom-black mb-2">Area Name: {req.name}</p>
              <p className="text-sm text-custom-black">Status: {req.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* View Assigned Areas */}
    {viewMode && (
      <div className="mt-6">
        <h3 className="text-xl font-bold mb-4">Assigned Areas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {areas.length > 0 && (
            areas.map((area, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300 ease-in-out"
              >
                <h4 className="text-lg text-custom-black font-semibold mb-2">{area.name}</h4>
                <p className="text-sm text-custom-black mb-2">
                  License Plate: {area.licenseplate || "null"}
                </p>
              </div>
            ))
          ) }
        </div>
        {areas.length == 0 && (
            <div className="flex justify-center items-center h-40">
              <NoDataDisplay emptyText="No Assigned Areas Found" />
            </div>
          )}
      </div>
    )}

    {/* Manage Areas */}
    {!viewMode && (
      <div className="mt-6">
        <label className="block mb-4 text-lg font-semibold">Select Non-Assigned Areas:</label>
        <div className="mb-6">
          {nonAssignedAreas.length > 0 ? (
            nonAssignedAreas.map((area, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={`area-${area.area_id}`}
                  value={area.area_id}
                  onChange={handleAreaSelect}
                  className="mr-2"
                />
                <label htmlFor={`area-${area.area_id}`}>{area.name}</label>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No non-assigned areas available.</p>
          )}
        </div>

        {selectedAreas.length > 0 && (
          <div>
            <button
              className="px-4 py-2 bg-custom-green text-custom-black rounded hover:bg-green-600 hover:rounded-2xl border border-custom-black"
              onClick={handleAssignArea}
            >
              Click to send the add area request for approval
            </button>
            <button
              className="ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={() => {
                setIsAddingArea(false);
                setSelectedAreas([]); // Reset selection if canceled
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    )}
  </div>
</div>
  );
  };

export default ManageAndViewAreas;
