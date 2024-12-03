import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Loader from "../ui/Loader";

const Truck_Information = () => {
  const [trucksInfo, setTrucksInfo] = useState([]);
  const [loading, setLoading] = useState(true)
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
    const fetchData = async () => {
      // Simulating a 1-second delay before fetching data
      setTimeout(async () => {
        await fetchTrucksInfo();  // Fetch the truck info after 1-second delay
        setLoading(false);  // Set loading to false after fetching is complete
      }, 1000); // 1-second delay
    };

    fetchData();
  }, []);
  if (loading) return<><Loader></Loader></>;

  return (
<div className="p-4">
  <h2 className="text-xl font-bold text-custom-black">Truck Information</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
    {trucksInfo.map((truck, index) => (
      <div
        key={index}
        className="p-6 bg-white rounded-lg shadow-lg flex flex-col space-y-4 transition-transform transform hover:scale-105"
      >
        <div className="text-lg font-semibold text-custom-black">
          ID: <span className="font-normal">{truck.truckid}</span>
        </div>
        <div className="text-lg text-custom-black">
          Assigned Area: <span className="font-normal">{truck.name}</span>
        </div>
        <div className="text-lg text-custom-black">
          Capacity Status: <span className="font-normal">{truck.capacity}</span>
        </div>
        <button className="mt-auto px-6 py-3 bg-custom-green text-black rounded-lg transition duration-200 hover:rounded-2xl border border-black">
          Edit Truck Info
        </button>
      </div>
    ))}
  </div>
</div>


  );
};

export default Truck_Information;
