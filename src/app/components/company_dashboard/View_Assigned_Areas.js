import React, { useState, useEffect } from "react";

const View_Assigned_Areas = () => {
  const [assignedAreas, setAssignedAreas] = useState([]);

  const fetchAssignedAreas = async () => {
    try {
      const response = await fetch(`/api/area/get_all_assigned_areas/2/`); // Assuming company ID = 2
      const data = await response.json();
      console.log(data)
      if (data.success) {
        setAssignedAreas(data.data); // Assuming the API returns an array of assigned areas
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching assigned areas:", error);
    }
  };

  useEffect(() => {
    fetchAssignedAreas();
  }, []); // Fetch areas on component mount

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">View Assigned Areas</h2>
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
          {assignedAreas.length > 0 ? (
            assignedAreas.map((area, index) => (
              <tr key={index}>
                <td className="py-2 px-4 border-b">{area.name}</td>
                <td className="py-2 px-4 border-b">{area.truckid}</td>
                <td className="py-2 px-4 border-b">{area.licenseplate}</td>
                
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
  );
};

export default View_Assigned_Areas;
