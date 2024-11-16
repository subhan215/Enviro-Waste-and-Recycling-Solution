import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
const Manage_Areas = () => {
  const [areas, setAreas] = useState(["Area 1", "Area 2", "Area 3"]);
  const [nonAssignedAreas, setNonAssignedAreas] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [isAddingArea, setIsAddingArea] = useState(false);
  const userData = useSelector((state) => state.userData.value)
 console.log(selectedAreas)
  // Function to fetch non-assigned areas from the API
  const fetchNonAssignedAreas = async () => {
    try {
      const response = await fetch("/api/area/get_all_non_served_areas");
      const data = await response.json();
      setNonAssignedAreas(data.data); // Assuming the API returns an array of areas
    } catch (error) {
      console.error("Error fetching non-assigned areas:", error);
    }
  };

  const handleAddAreaClick = () => {
    setIsAddingArea(true);  // Open the area selection form
    fetchNonAssignedAreas(); // Fetch non-assigned areas
  };

  const handleAreaSelect = (e) => {
    console.log("area id: " , e.target.value) ; 
    const areaId = parseInt(e.target.value);
    setSelectedAreas((prevSelectedAreas) =>
      prevSelectedAreas.includes(areaId)
        ? prevSelectedAreas.filter((id) => id != areaId) // Deselect area
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
          body: JSON.stringify({ selectedAreas , company_id: userData.user_id }),
        });

        const responseData = await response.json();
        console.log(responseData);

        if (responseData.success) {
          alert("Assigned areas to company!");
          // Optionally, update the existing areas after assigning
          /*setAreas((prevAreas) => [
            ...prevAreas,
            ...nonAssignedAreas.filter((area) => selectedAreas.includes(area.area_id)),
          ]); */
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

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Manage Areas</h2>
      <p>Select or manage service areas for your company.</p>

      {/* Existing areas */}
      <ul className="list-disc ml-6">
        {areas.map((area, index) => (
          <li key={index}>{area}</li>
        ))}
      </ul>

      {/* Add New Area Button */}
      {!isAddingArea && (
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handleAddAreaClick}
        >
          Add New Area
        </button>
      )}

      {/* Area Selection Form */}
      {isAddingArea && (
        <div className="mt-4">
          <label className="block mb-2">Select Non-Assigned Areas:</label>
          <div className="mb-4">
            {nonAssignedAreas && nonAssignedAreas.map((area, index) => (
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
            ))}
          </div>

          <button
            className="px-4 py-2 bg-green-500 text-white rounded"
            onClick={handleAssignArea}
          >
            Assign Areas
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
        </div>
      )}
    </div>
  );
};

export default Manage_Areas;
