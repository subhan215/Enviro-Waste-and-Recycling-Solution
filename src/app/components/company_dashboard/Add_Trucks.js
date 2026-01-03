import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Truck_loader from "../ui/Truck_loader";
import Alert from '../ui/Alert';

const Add_Trucks = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState({
    licensePlate: "",
    capacity: "",
    area_id: "",
  });
  const [allAreas, setAllAreas] = useState([]);
  const userData = useSelector((state) => state.userData.value);
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
      let response = await fetch(`/api/area/get_truck_not_assigned_areas/${userData.user_id}/`, {
        headers: { "Content-Type": "application/json" },
        method: "GET",
      });
      const responseData = await response.json();
      if (responseData.success) {
        setAllAreas(responseData.data);
      } else {
        showAlert("error", responseData.message);
      }
    } catch (error) {
      showAlert("error", error.message);
    }
  };

  useEffect(() => {
    const run_add_truck = async () => {
      setLoading(true);
      try {
        await getNonAssignedTruckAreas();
      } catch {
        showAlert("error", "Error getting non assigned area");
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };
    run_add_truck();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let response = await fetch(`/api/area/assign_truck_to_area/${userData.user_id}/`, {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ truck_data: { ...data } })
      });
      const responseData = await response.json();
      if (responseData.success) {
        setData({ licensePlate: "", capacity: "", area_id: "" });
        showAlert("success", "Truck assigned to area successfully!");
        setAllAreas(responseData.data);
      } else {
        showAlert("error", responseData.message);
      }
    } catch (error) {
      showAlert("error", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Truck_loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {alert.map((a) => (
        <Alert
          key={a.id}
          type={a.type}
          message={a.message}
          onClose={() => setAlert((alerts) => alerts.filter((al) => al.id !== a.id))}
        />
      ))}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Assign Trucks</h1>
        <p className="text-gray-500 mt-1">Add and assign trucks to service areas</p>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Available Areas</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{allAreas?.length || 0}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Ready to Assign</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{allAreas?.length > 0 ? 'Yes' : 'No'}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Add New Truck</h2>
              <p className="text-sm text-gray-500">Fill in the details to assign a truck</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* License Plate */}
          <div>
            <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700 mb-2">
              License Plate
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
              <input
                type="text"
                id="licensePlate"
                value={data.licensePlate}
                onChange={(e) => setData({ ...data, licensePlate: e.target.value })}
                placeholder="e.g., ABC-1234"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Select Area */}
          <div>
            <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
              Select Area
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <select
                id="area"
                value={data.area_id}
                onChange={(e) => setData({ ...data, area_id: e.target.value })}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white transition-all"
              >
                <option value="" disabled>Select an area</option>
                {allAreas?.length > 0 ? (
                  allAreas.map((area) => (
                    <option key={area.area_id} value={area.area_id}>
                      {area.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No areas available</option>
                )}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Capacity */}
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
              Capacity (in tons)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <input
                type="number"
                id="capacity"
                value={data.capacity}
                onChange={(e) => setData({ ...data, capacity: e.target.value })}
                placeholder="e.g., 5.5"
                step="0.01"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || allAreas?.length === 0}
            className={`w-full py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              submitting || allAreas?.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow-md'
            }`}
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Assigning...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Assign Truck
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Add_Trucks;
