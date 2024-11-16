import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
const Truck_Information = () => {
  const [trucksInfo, setTrucksInfo] = useState([]);
  const userData = useSelector((state) => state.userData.value)
  let companyId = userData.user_id
  const fetchTrucksInfo = async () => {
    try {
      const response = await fetch(`/api/trucks/get_Trucks_Information/${companyId}/`); // Assuming company ID = 2
      const data = await response.json();
      console.log(data);

      if (data.success) {
        setTrucksInfo(data.data); // Assuming the API returns an array of truck information
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching truck information:", error);
    }
  };

  useEffect(() => {
    fetchTrucksInfo();
  }, []); // Fetch truck information on component mount

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Truck Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {trucksInfo.map((truck, index) => (
          <div
            key={index}
            className="p-4 bg-white rounded shadow-md flex flex-col"
          >
            <p className="font-semibold">ID: {truck.truckid}</p>
            <p>Assigned Area: {truck.name}</p>
            <p>Last Service Date: {/* You may want to add this field if available */}</p>
            <p>Capacity Status: {truck.capacity}</p>
            <button className="mt-auto px-4 py-2 bg-blue-500 text-white rounded">
              Edit Truck Info
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Truck_Information;
