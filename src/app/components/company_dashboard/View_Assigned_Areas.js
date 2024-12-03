import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Loader from '../ui/Loader';


const ManageAndViewAreas = () => {
  const [areas, setAreas] = useState([]);
  const [nonAssignedAreas, setNonAssignedAreas] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [isAddingArea, setIsAddingArea] = useState(false);
  const [viewMode, setViewMode] = useState(true); // true for viewing, false for managing
  const userData = useSelector((state) => state.userData.value);
  const [areaRequests , setAreaRequests] = useState([])
  const [loading, setLoading] = useState(true) ; 
  let companyId = userData.user_id;
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

  const handleAddAreaClick = () => {
    setIsAddingArea(true);  // Open the area selection form
  };

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
          alert("Assigned areas to company!");
          fetchAreas(); // Re-fetch areas after assignment
          setIsAddingArea(false);
          setSelectedAreas([]); // Clear the selected areas after assigning
          setViewMode(true) ; 
          setNonAssignedAreas([])
        } else {
          alert(responseData.message);
        }
      } catch (error) {
        alert(error.message);
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
<div className="p-6 bg-white min-h-screen">
  <div className="bg-white shadow-md rounded p-6">
    <h2 className="text-2xl font-bold mb-4">Manage and View Areas</h2>
    {/* <p className="mb-4">{viewMode ? "View assigned areas" : "Add New Area"}</p> */}

    {/* Toggle between view and manage modes */}
    <button
      className="mb-6 px-4 py-2 bg-custom-green text-black rounded hover:rounded-2xl border border-custom-black"
      onClick={() => setViewMode((prev) => !prev)}
    >
      {viewMode ? "Add new area" : "View Assigned Areas"}
    </button>

    {/* Fetch Area Requests */}
    <div className="mb-6">
      {loading ? (
        <p className="text-gray-600">Loading....</p>
      ) : (
        <p className="text-gray-600">No requests fetched</p>
      )}
      <button
        className="mt-2 px-4 py-2 bg-custom-green text-black rounded hover:rounded-2xl border border-custom-black"
        onClick={fetchAreaRequests}
      >
        Fetch Area Requests
      </button>
      {areaRequests.length > 0 && (
        <div className="mt-4">
          {areaRequests.map((req, index) => (
            <div key={index} className="bg-gray-50 p-4 mb-4 rounded shadow">
              <p className="font-semibold">Request {index + 1}</p>
              <p>Area name: {req.name}</p>
              <p>Status: {req.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* View Assigned Areas */}
    {viewMode && (
      <div className="mt-6">
        <h3 className="text-xl font-bold mb-4">Assigned Areas</h3>
        <table className="min-w-full bg-white shadow-md rounded">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left">Area Name</th>
              <th className="py-2 px-4 border-b text-left">Truck ID</th>
              <th className="py-2 px-4 border-b text-left">License Plate</th>
              <th className="py-2 px-4 border-b text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {areas.length > 0 ? (
              areas.map((area, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="py-2 px-4 border-b">{area.name}</td>
                  <td className="py-2 px-4 border-b">{area.truckid ? area.truckid : "null"}</td>
                  <td className="py-2 px-4 border-b">{area.licenseplate ? area.licenseplate : "null"}</td>
                  <td className="py-2 px-4 border-b">{area.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4">No assigned areas found</td>
              </tr>
            )}
          </tbody>
        </table>
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
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
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
