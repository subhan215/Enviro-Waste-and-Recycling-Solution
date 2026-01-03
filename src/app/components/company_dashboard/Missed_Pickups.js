import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Loader from "../ui/Loader";
import NoDataHappyFace from "../animations/noDataHappyFace";
import Alert from '../ui/Alert';

const Missed_Pickups = () => {
  const [missedPickups, setMissedPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState(null);
  const [selectedPickupId, setSelectedPickupId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState([]);

  const showAlert = (type, message) => {
    const id = Date.now();
    setAlert([...alert, { id, type, message }]);
    setTimeout(() => {
      setAlert((alerts) => alerts.filter((alert) => alert.id !== id));
    }, 4000);
  };

  const userData = useSelector((state) => state.userData.value);
  const companyId = userData.user_id;

  useEffect(() => {
    const fetchMissedPickups = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/pickup/get_All_missed_pickups_for_company/${companyId}`
        );
        setMissedPickups(response.data.data);
      } catch {
        setError("Failed to load missed pickups.");
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };
    fetchMissedPickups();
  }, [companyId]);

  const handleImageChange = (e, missedPickupId) => {
    const file = e.target.files[0];
    setSelectedImage(file);
    setSelectedPickupId(missedPickupId);

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImagePreview(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const markAsCompleted = async (missedPickupId) => {
    if (!selectedImage || selectedPickupId !== missedPickupId) {
      showAlert("warning", "Please select an image for the missed pickup.");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("userId", companyId);
    formData.append("missed_pickup_id", missedPickupId);
    formData.append("clean_or_unclean_image", selectedImage);

    try {
      const response = await axios.put(
        `/api/pickup/completed_by_company/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.success) {
        setMissedPickups((prevPickups) =>
          prevPickups.map((pickup) =>
            pickup.missed_pickup_id === missedPickupId
              ? { ...pickup, status: "marked completed by company" }
              : pickup
          )
        );
        showAlert("success", "Missed pickup marked as completed.");
        setSelectedImage(null);
        setSelectedImagePreview(null);
        setSelectedPickupId(null);
      } else {
        showAlert("error", "Upload failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      showAlert("error", "Failed to update the status of the missed pickup.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { label: 'Pending', color: 'yellow', icon: '⏳' };
      case 'marked completed by company':
        return { label: 'Awaiting Response', color: 'blue', icon: '📤' };
      case 'marked completed by user':
        return { label: 'User Responded', color: 'purple', icon: '📥' };
      case 'confirmed':
        return { label: 'Confirmed', color: 'green', icon: '✅' };
      default:
        return { label: status, color: 'gray', icon: '📋' };
    }
  };

  if (loading) return <Loader />;

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
        {error}
      </div>
    </div>
  );

  const pendingCount = missedPickups.filter(p => p.status === 'pending' || p.status === 'marked completed by user').length;
  const awaitingCount = missedPickups.filter(p => p.status === 'marked completed by company').length;

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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Missed Pickups</h1>
        <p className="text-gray-500 mt-1">Handle reported missed waste pickups</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Reports</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{missedPickups.length}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Needs Action</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Awaiting Response</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{awaitingCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Reported Pickups</h2>
              <p className="text-sm text-gray-500">Upload proof image to mark as completed</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {missedPickups.length === 0 ? (
            <div className="py-8">
              <NoDataHappyFace emptyText="No missed pickups reported" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {missedPickups.map((pickup) => {
                const date = new Date(pickup.created_at);
                const formattedDate = date.toLocaleDateString();
                const formattedTime = date.toLocaleTimeString();
                const statusInfo = getStatusInfo(pickup.status);
                const canUpload = pickup.status === "pending" || pickup.status === "marked completed by user";

                return (
                  <div
                    key={pickup.missed_pickup_id}
                    className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    {/* Card Header */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{pickup.name}</h3>
                            <p className="text-xs text-gray-500">{formattedDate} at {formattedTime}</p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            statusInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                            statusInfo.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                            statusInfo.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                            statusInfo.color === 'green' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>

                    {/* Image Section */}
                    {pickup.unclean_img && !(selectedImagePreview && selectedPickupId === pickup.missed_pickup_id) && (
                      <div className="relative">
                        <img
                          src={pickup.unclean_img}
                          alt="Reported Issue"
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded-lg">
                          Reported Issue
                        </div>
                      </div>
                    )}

                    {/* Preview Section */}
                    {selectedImagePreview && selectedPickupId === pickup.missed_pickup_id && (
                      <div className="relative">
                        <img
                          src={selectedImagePreview}
                          alt="Your Upload"
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-emerald-600 text-white text-xs rounded-lg">
                          Your Upload
                        </div>
                        <button
                          onClick={() => {
                            setSelectedImage(null);
                            setSelectedImagePreview(null);
                            setSelectedPickupId(null);
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* Action Section */}
                    {canUpload && (
                      <div className="p-4 space-y-3">
                        <label
                          htmlFor={`file-input-${pickup.missed_pickup_id}`}
                          className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium text-sm">Choose Photo</span>
                          <input
                            id={`file-input-${pickup.missed_pickup_id}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, pickup.missed_pickup_id)}
                            className="hidden"
                          />
                        </label>

                        <button
                          onClick={() => markAsCompleted(pickup.missed_pickup_id)}
                          disabled={submitting || !selectedImage || selectedPickupId !== pickup.missed_pickup_id}
                          className={`w-full py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                            selectedImage && selectedPickupId === pickup.missed_pickup_id
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {submitting && selectedPickupId === pickup.missed_pickup_id ? (
                            <>
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Mark as Completed
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {!canUpload && (
                      <div className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Waiting for user confirmation
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Missed_Pickups;
