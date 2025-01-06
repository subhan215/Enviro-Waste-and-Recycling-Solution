import React, { useState, useEffect } from "react";
//import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Truck_loader from "../ui/Truck_loader";
import Alert from '../ui/Alert'

const Add_Trucks = () => {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState({
        licensePlate: "", 
        capacity: "", 
        area_id: "" , 
    });
    const [allAreas, setAllAreas] = useState([]); // State to store available areas
    const userData = useSelector((state) => state.userData.value)
    const [alert, setAlert] = useState([]);


    const showAlert = (type, message) => {
      const id = Date.now();
      setAlert([...alert, { id, type, message }]);
      setTimeout(() => {
        setAlert((alerts) => alerts.filter((alert) => alert.id !== id));
      }, 4000);
    };



    const getNonAssignedTruckAreas = async () => {
        try {
            console.log("Fetching non-assigned areas...");
            let response = await fetch(`/api/area/get_truck_not_assigned_areas/${userData.user_id}/`, {
                headers: {
                    "Content-Type": "application/json",
                },
                method: "GET",
            });

            const responseData = await response.json();
            console.log(responseData)
            if (responseData.success) {
                setAllAreas(responseData.data); // Set the fetched areas into state
            } else {
                //alert(responseData.message);
        showAlert("error", responseData.message);
              
              }
        } catch (error) {
           // alert(error.message);
        showAlert("error", error.message);
          
          }
    };

    // Fetch areas when the component mounts
    useEffect(() => {
        const run_add_truck = async () => {
      setLoading(true);
      try {
        await getNonAssignedTruckAreas();
      } catch {
        //console.error('Error getting non assigned area:', error);
        showAlert("error", "Error getting non assigned area");
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000); // Delay for 5 seconds
      }   
    };
    run_add_truck();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Handle form submission logic here (e.g., send truck data to API)
        console.log("Form data:", data);
        try {
            let response = await fetch(`/api/area/assign_truck_to_area/${userData.user_id}/`, {
                headers: {
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({truck_data: {...data}})
            });

            const responseData = await response.json();
            console.log(responseData)
            if (responseData.success) {
                setData({licensePlate: "" , capacity: "" , area_id: ""})
                //alert("");
                //addAlert("success", "Assigned truck to area successfully!");
                //setAlert({ type: 'success', message: 'Assigned truck to area successfully!' });
                showAlert("success", "Assigned truck to area successfully!");
                setAllAreas(responseData.data); // Set the fetched areas into state
            } else {
                //alert(responseData.message);
                showAlert("error", responseData.message);
            }
        } catch (error) {
            //alert(error.message);
            showAlert("error", error.message);

        }
    };

    if(loading) return <Truck_loader></Truck_loader>
    return (
      <>
        <div className="container mx-auto px-4 py-8">
        <div className="p-8 shadow-lg rounded-lg ">
          <h2 className="text-3xl font-bold text-custom-black p-2 mb-6 rounded text-center">
            Add Truck Information
          </h2>
          {alert.map((alert) => (
        <Alert
          key={alert.id}
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert((alert) => alert.filter((a) => a.id !== alert.id))}
        />
      ))}
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="mb-4">
              <label htmlFor="licensePlate" className="block text-lg font-semibold text-custom-black mb-2">
                License Plate:
              </label>
              <input
                type="text"
                id="licensePlate"
                value={data.licensePlate}
                onChange={(e) => setData({ ...data, licensePlate: e.target.value })}
                placeholder="License Plate"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-custom-black"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="area" className="block text-lg font-semibold text-custom-black mb-2">
                Select Area:
              </label>
              <select
                id="area"
                value={data.area_id}
                onChange={(e) => setData({ ...data, area_id: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-custom-black"
              >
                <option value="" disabled className="text-custom-black">
                  Select Area
                </option>
                {allAreas?.length > 0 ? (
                  allAreas.map((area) => (
                    <option key={area.area_id} value={area.area_id}>
                      {area.name}
                    </option>
                  ))
                ) : (
                  <option value="">No areas available</option>
                )}
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="capacity" className="block text-lg font-semibold text-custom-black mb-2">
                Capacity (in tons):
              </label>
              <input
                type="number"
                id="capacity"
                value={data.capacity}
                onChange={(e) => setData({ ...data, capacity: e.target.value })}
                placeholder="Capacity (in tons)"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-custom-black"
              />
            </div>
            <button
              type="submit"
              className="bg-custom-green text-custom-black py-2 px-4 rounded-lg font-bold border border-custom-black hover:bg-custom-green transition duration-300 hover:rounded-2xl"
            >
              Add Truck
            </button>
          </form>
        </div>
      </div>
      </>
    );
};

export default Add_Trucks;
