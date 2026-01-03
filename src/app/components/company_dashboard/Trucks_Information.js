import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Loader from "../ui/Loader";
import NoDataDisplay from "../animations/NoDataDisplay";
import Alert from '../ui/Alert';

const Truck_Information = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [formValues, setFormValues] = useState({ licenseplate: "", capacity: "" });
  const [trucksInfo, setTrucksInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const userData = useSelector((state) => state.userData.value);
  const [alert, setAlert] = useState([]);

  const showAlert = (type, message) => {
    const id = Date.now();
    setAlert([...alert, { id, type, message }]);
    setTimeout(() => {
      setAlert((alerts) => alerts.filter((alert) => alert.id !== id));
    }, 4000);
  };

  let companyId = userData.user_id;

  const fetchTrucksInfo = async () => {
    try {
      const response = await fetch(`/api/trucks/get_Trucks_Information/${companyId}/`);
      const data = await response.json();
      if (data.success) {
        setTrucksInfo(data.data);
      } else {
        showAlert("error", data.message);
      }
    } catch {
      showAlert("error", "Error fetching truck information");
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

  const handleEditClick = (truck) => {
    setSelectedTruck(truck);
    setFormValues({ licenseplate: truck.licenseplate, capacity: truck.capacity });
    setShowModal(true);
  };

  const handleFormSubmit = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/trucks/update_Truck_Information/${selectedTruck.truckid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });
      const data = await response.json();
      if (response.ok) {
        showAlert("success", "Truck updated successfully!");
        setShowModal(false);
        await fetchTrucksInfo();
      } else {
        showAlert("error", data.message || "Failed to update truck");
      }
    } catch (error) {
      console.error("Error updating truck:", error);
      showAlert("error", "Error updating truck");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <Loader />;

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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Truck Information</h1>
        <p className="text-gray-500 mt-1">View and manage your fleet details</p>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Trucks</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{trucksInfo.length}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Capacity</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {trucksInfo.reduce((sum, truck) => sum + parseFloat(truck.capacity || 0), 0).toFixed(1)} tons
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Trucks List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Your Fleet</h2>
              <p className="text-sm text-gray-500">Click on a truck to edit its details</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {trucksInfo.length === 0 ? (
            <div className="py-8">
              <NoDataDisplay emptyText="No trucks assigned yet" />
              <p className="text-center text-gray-500 mt-4">
                Go to "Assign Trucks" to add trucks to your fleet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trucksInfo.map((truck, index) => (
                <div
                  key={index}
                  className="group bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-5 hover:shadow-lg hover:border-emerald-200 transition-all duration-300 cursor-pointer"
                  onClick={() => handleEditClick(truck)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <button
                      className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(truck);
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">License Plate</p>
                      <p className="text-lg font-bold text-gray-800 mt-1">{truck.licenseplate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-lg p-3">
                        <p className="text-xs text-gray-500 font-medium">Capacity</p>
                        <p className="text-sm font-semibold text-gray-800">{truck.capacity} tons</p>
                      </div>
                      <div className="flex-1 bg-emerald-50 rounded-lg p-3">
                        <p className="text-xs text-emerald-600 font-medium">Status</p>
                        <p className="text-sm font-semibold text-emerald-700">Active</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Edit Truck</h3>
                    <p className="text-emerald-100 text-sm">Update truck details</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div>
                <label htmlFor="licenseplate" className="block text-sm font-medium text-gray-700 mb-2">
                  License Plate
                </label>
                <input
                  type="text"
                  id="licenseplate"
                  name="licenseplate"
                  value={formValues.licenseplate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity (tons)
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formValues.capacity}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFormSubmit}
                disabled={saving}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Truck_Information;
