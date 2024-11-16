import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const ManageAndViewAreas = () => {
  const [areas, setAreas] = useState([]);
  const [nonAssignedAreas, setNonAssignedAreas] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [isAddingArea, setIsAddingArea] = useState(false);
  const [viewMode, setViewMode] = useState(true); // true for viewing, false for managing
  const userData = useSelector((state) => state.userData.value);
  const [areaRequests , setAreaRequests] = useState([])
  const [loading, setLoading] = useState(false) ; 
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
    fetchNonAssignedAreas();
    fetchAreas() ; 
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
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Manage and View Areas</h2>
      <p>{viewMode ? "View assigned areas" : "Add New Area"}</p>

      {/* Toggle between view and manage modes */}
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => setViewMode((prev) => !prev)}
      >
        {viewMode ? "Add new area" : "View Assigned Areas"}
      </button>
      <div>
        {loading ? <p>Loading....</p> : <p>no Requests fetched </p>}
      <button onClick={fetchAreaRequests}>
        Fetch Area Requests
      </button>
      {areaRequests.length > 0 ? (
      areaRequests.map((req, index)=> (
      (
        <div>
            <p>Request {index+1}</p>
            <p>area name: {req.name}</p>
            <p>status: {req.status}</p>
        </div>
      )
      ))) : null}
      </div>
      {/* View Assigned Areas */}
      {viewMode && (
        <div className="mt-4">
          <h3 className="text-lg font-bold">Assigned Areas</h3>
          <table className="min-w-full bg-white shadow-md rounded">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Area Name</th>
                <th className="py-2 px-4 border-b">Truck ID</th>
                <th className="py-2 px-4 border-b">License Plate</th>
                <th className="py-2 px-4 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {areas.length > 0 ? (
                areas.map((area, index) => (
                  <tr key={index}>
                    <td className="py-2 px-4 border-b">{area.name}</td>
                    <td className="py-2 px-4 border-b">{area.truckid ? area.truckid: "null"}</td>
                    <td className="py-2 px-4 border-b">{area.licenseplate ? area.licenseplate: "null"}</td>
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
        <div className="mt-4">
            <div>
              <label className="block mb-2">Select Non-Assigned Areas:</label>
              <div className="mb-4">
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
                  <p>No non-assigned areas available.</p>
                )}
              </div>
                {selectedAreas.length > 0 && <>              <button
                className="px-4 py-2 bg-green-500 text-white rounded"
                onClick={handleAssignArea}
              >
                 Click to send the add area request for approval
              </button>

              <button
                className="ml-2 px-4 py-2 bg-red-500 text-white rounded"
                onClick={() => {
                  setIsAddingArea(false);
                  setSelectedAreas([]); // Reset selection if canceled
                }}
              >
                Cancel
              </button>
              </>}
            </div>
          
        </div>
      )}
    </div>
  );
};

export default ManageAndViewAreas;
