import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Loader from "../ui/Loader";
import NoDataDisplay from "../animations/NoDataDisplay";
import Alert from '../ui/Alert';

const ReportMissedPickups = () => {
  const [allMissedPickups, setAllMissedPickups] = useState([]);
  const userData = useSelector((state) => state.userData.value);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState([]);

  const showAlert = (type, message) => {
    const id = Date.now();
    setAlert([...alert, { id, type, message }]);
    setTimeout(() => {
      setAlert((alerts) => alerts.filter((alert) => alert.id !== id));
    }, 4000);
  };

  let userId = userData?.user_id;
  let areaId = userData?.area_id;

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);
    if (file) {
      setSelectedImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setSelectedImagePreview(null);
  };

  const reportMissedPickup = async (event) => {
    event.preventDefault();

    if (allMissedPickups.length > 0) {
      const lastMissedPickup = allMissedPickups[0];
      const lastReportedTime = new Date(lastMissedPickup.created_at).getTime();
      const currentTime = new Date().getTime();
      const timeDifference = currentTime - lastReportedTime;
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (timeDifference < twentyFourHours) {
        showAlert("warning", "You can only report one missed pickup every 24 hours");
        return;
      }
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("areaId", areaId);
      if (selectedImage) {
        formData.append("clean_or_unclean_image", selectedImage);
      }

      let response = await fetch(`/api/pickup/report_missed_pickup/`, {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();
      if (responseData.success) {
        getAllMissedPickups();
        showAlert("success", "Missed pickup reported successfully");
        setSelectedImagePreview(null);
        setSelectedImage(null);
      } else {
        showAlert("error", responseData.message);
      }
    } catch (error) {
      showAlert("error", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getAllMissedPickups = async () => {
    try {
      let response = await fetch(`/api/pickup/get_All_missed_pickups_for_user/${userId}/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const responseData = await response.json();
      if (responseData.success) {
        setAllMissedPickups(responseData.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateMissedPickupStatus = async (missedPickupId, newStatus = "") => {
    try {
      const response = await fetch(`/api/pickup/confirmed_from_user/`, {
        headers: { "Content-Type": "application/json" },
        method: "PUT",
        body: JSON.stringify({
          missed_pickup_id: missedPickupId,
          userId,
          newStatus,
        }),
      });

      const responseData = await response.json();
      if (responseData.success) {
        getAllMissedPickups();
        showAlert("success", "Status updated successfully");
      } else {
        showAlert("error", responseData.message);
      }
    } catch (error) {
      showAlert("error", error.message);
    }
  };

  useEffect(() => {
    const fetchMissedPickups = async () => {
      setLoading(true);
      try {
        await getAllMissedPickups();
      } catch (error) {
        console.error('Error fetching missed pickups:', error);
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    };
    fetchMissedPickups();
  }, [userId]);

  const getStatusBadge = (status) => {
    const styles = {
      'pending': 'bg-amber-100 text-amber-700',
      'completed': 'bg-emerald-100 text-emerald-700',
      'marked completed by company': 'bg-blue-100 text-blue-700',
      'marked completed by user': 'bg-purple-100 text-purple-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-600';
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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Report Missed Pickups</h1>
        <p className="text-gray-500 mt-1">Let us know if your waste wasn&apos;t collected on schedule</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Reports</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{allMissedPickups.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {allMissedPickups.filter(p => p.status === 'pending').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Resolved</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {allMissedPickups.filter(p => p.status === 'completed').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
            <div className="border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">New Report</h2>
                  <p className="text-sm text-gray-500">Submit a missed pickup</p>
                </div>
              </div>
            </div>

            <form onSubmit={reportMissedPickup} className="p-6 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo Evidence (Optional)
                </label>
                {!selectedImagePreview ? (
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-500">Click to upload photo</p>
                      <p className="text-xs text-gray-400 mt-1">Shows uncollected waste</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative">
                    <img
                      src={selectedImagePreview}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-xl border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Report Missed Pickup
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center">
                You can submit one report every 24 hours
              </p>
            </form>
          </div>
        </div>

        {/* Reports List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Your Reports</h2>
                  <p className="text-sm text-gray-500">Track the status of your submissions</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {allMissedPickups.length === 0 ? (
                <NoDataDisplay emptyText="No missed pickups reported yet" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allMissedPickups.map((pickup) => (
                    <div
                      key={pickup.missed_pickup_id}
                      className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-5 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{pickup.name}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(pickup.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(pickup.status)}`}>
                          {pickup.status}
                        </span>
                      </div>

                      {pickup.clean_img && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-1">Cleanup Evidence</p>
                          <img
                            src={pickup.clean_img}
                            alt="Cleanup"
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        {pickup.status === "marked completed by company" && (
                          <>
                            <button
                              onClick={() => updateMissedPickupStatus(pickup.missed_pickup_id, "completed")}
                              className="w-full py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors text-sm flex items-center justify-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Confirm Completed
                            </button>
                            <button
                              onClick={() => updateMissedPickupStatus(pickup.missed_pickup_id, "pending")}
                              className="w-full py-2 border border-amber-500 text-amber-600 rounded-lg font-medium hover:bg-amber-50 transition-colors text-sm flex items-center justify-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Still Pending
                            </button>
                          </>
                        )}
                        {pickup.status === "pending" && (
                          <button
                            onClick={() => updateMissedPickupStatus(pickup.missed_pickup_id, "marked completed by user")}
                            className="w-full py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm flex items-center justify-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Mark as Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportMissedPickups;
