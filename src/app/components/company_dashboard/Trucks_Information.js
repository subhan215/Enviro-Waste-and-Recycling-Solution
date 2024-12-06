import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Loader from "../ui/Loader";
import NoDataDisplay from "../animations/NoDataDisplay";

const Truck_Information = () => {
  const [trucksInfo, setTrucksInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState(null); // Stores the truck to be edited
  const [formValues, setFormValues] = useState({ licenseplate: "", capacity: "" });
  const userData = useSelector((state) => state.userData.value);
  let companyId = userData.user_id;

  // Fetch trucks information
  const fetchTrucksInfo = async () => {
    try {
      const response = await fetch(`/api/trucks/get_Trucks_Information/${companyId}/`);
      const data = await response.json();
      if (data.success) {
        setTrucksInfo(data.data);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching truck information:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setTimeout(async () => {
        await fetchTrucksInfo();
        setLoading(false);
      }, 1000);
    };
    fetchData();
  }, []);

  // Handle Modal Open
  const handleEditClick = (truck) => {
    setSelectedTruck(truck);
    setFormValues({ licenseplate: truck.licenseplate, capacity: truck.capacity });
    setShowModal(true);
  };

  // Handle Form Submission
  const handleFormSubmit = async () => {
    try {
      const response = await fetch(`/api/trucks/update_Truck_Information/${selectedTruck.truckid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Truck updated successfully");
        setShowModal(false);
        await fetchTrucksInfo(); // Refresh the truck list
      } else {
        console.error(data.message);
        alert("Failed to update truck");
      }
    } catch (error) {
      console.error("Error updating truck:", error);
    }
  };

  // Handle Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-custom-black">Truck Information</h2>
      {trucksInfo.length === 0 ? (
        <NoDataDisplay emptyText="You haven't assigned any trucks yet!" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
          {trucksInfo.map((truck, index) => (
            <div
              key={index}
              className="p-6 bg-white rounded-lg shadow-lg flex flex-col space-y-4 transition-transform transform hover:scale-105"
            >
              <div className="text-lg font-semibold text-custom-black">
                License Plate: <span className="font-normal">{truck.licenseplate}</span>
              </div>
              <div className="text-lg text-custom-black">
                Capacity: <span className="font-normal">{truck.capacity}</span>
              </div>
              <button
                onClick={() => handleEditClick(truck)}
                className="mt-auto px-6 py-3 bg-custom-green text-black rounded-lg transition duration-200 hover:rounded-2xl border border-black"
              >
                Edit Truck Info
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Custom Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg relative">
            <h3 className="text-lg font-semibold mb-4">Edit Truck Information</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="licenseplate" className="block text-sm font-medium text-gray-700">
                  License Plate
                </label>
                <input
                  type="text"
                  id="licenseplate"
                  name="licenseplate"
                  value={formValues.licenseplate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                />
              </div>
              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                  Capacity
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formValues.capacity}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleFormSubmit}
                className="px-4 py-2 bg-custom-green text-white rounded-lg hover:bg-green-400"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Truck_Information;
