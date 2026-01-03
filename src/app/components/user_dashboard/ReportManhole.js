import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Loader from "../ui/Loader";
import NoDataDisplay from "../animations/NoDataDisplay";
import Alert from '../ui/Alert';

const ReportManhole = () => {
  const [allManholeReports, setAllManholeReports] = useState([]);
  const userData = useSelector((state) => state.userData.value);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState(null);
  const [reportType, setReportType] = useState('open');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [nearbyLocation, setNearbyLocation] = useState('');
  const [loadingAreas, setLoadingAreas] = useState(false);

  const showAlert = (type, message) => {
    const id = Date.now();
    setAlert([...alert, { id, type, message }]);
    setTimeout(() => {
      setAlert((alerts) => alerts.filter((alert) => alert.id !== id));
    }, 4000);
  };

  let userId = userData?.user_id;

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

  const reportManhole = async (event) => {
    event.preventDefault();

    if (!selectedArea) {
      showAlert("warning", "Please select an area");
      return;
    }

    if (!selectedImage) {
      showAlert("warning", "Please select an image of the manhole issue");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("areaId", selectedArea);
      formData.append("reportType", reportType);
      formData.append("description", description);
      formData.append("streetNumber", streetNumber);
      formData.append("nearbyLocation", nearbyLocation);
      formData.append("manhole_image", selectedImage);

      await submitReport(formData);
    } catch (error) {
      showAlert("error", error.message);
      setSubmitting(false);
    }
  };

  const submitReport = async (formData) => {
    try {
      let response = await fetch(`/api/manhole/report`, {
        method: "POST",
        body: formData,
      });

      const text = await response.text();
      if (!text) {
        showAlert("error", "Server returned empty response. Please try again.");
        return;
      }

      const responseData = JSON.parse(text);
      if (responseData.success) {
        getAllManholeReports();
        showAlert("success", responseData.message || "Manhole report submitted successfully");
        setSelectedImagePreview(null);
        setSelectedImage(null);
        setDescription('');
        setReportType('open');
        setStreetNumber('');
        setNearbyLocation('');
        setSelectedArea('');
      } else {
        showAlert("error", responseData.message || "Failed to submit report");
      }
    } catch (error) {
      console.error("Submit error:", error);
      showAlert("error", error.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  const getAllManholeReports = async () => {
    if (!userId) return; // Don't fetch if userId is not available

    try {
      let response = await fetch(`/api/manhole/get_all_for_user/${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        console.error("Failed to fetch manhole reports:", response.status);
        return;
      }

      const text = await response.text();
      if (!text) {
        console.error("Empty response from server");
        return;
      }

      const responseData = JSON.parse(text);
      if (responseData.success) {
        setAllManholeReports(responseData.data || []);
      }
    } catch (error) {
      console.error("Error fetching manhole reports:", error);
    }
  };

  const updateManholeStatus = async (reportId, newStatus) => {
    try {
      const response = await fetch(`/api/manhole/confirm_resolution`, {
        headers: { "Content-Type": "application/json" },
        method: "PUT",
        body: JSON.stringify({
          report_id: reportId,
          user_id: userId,
          new_status: newStatus,
        }),
      });

      const responseData = await response.json();
      if (responseData.success) {
        getAllManholeReports();
        showAlert("success", "Status updated successfully");
      } else {
        showAlert("error", responseData.message);
      }
    } catch (error) {
      showAlert("error", error.message);
    }
  };

  const fetchAreas = async () => {
    setLoadingAreas(true);
    try {
      const response = await fetch('/api/area/get_all_areas', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        console.error('Failed to fetch areas:', response.status);
        return;
      }

      const text = await response.text();
      if (!text) {
        console.error('Empty response from server');
        return;
      }

      const responseData = JSON.parse(text);
      if (responseData.success) {
        setAreas(responseData.data || []);
      }
    } catch (error) {
      console.error('Error fetching areas:', error);
    } finally {
      setLoadingAreas(false);
    }
  };

  useEffect(() => {
    const fetchManholeReports = async () => {
      setLoading(true);
      try {
        await Promise.all([getAllManholeReports(), fetchAreas()]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    };
    fetchManholeReports();
  }, [userId]);

  const getReportTypeLabel = (type) => {
    const labels = {
      'lost': 'Lost/Missing Cover',
      'open': 'Open/Uncovered',
      'hidden': 'Hidden/Obstructed',
      'damaged': 'Damaged Cover',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status) => {
    const styles = {
      'pending': 'bg-amber-100 text-amber-700',
      'assigned': 'bg-blue-100 text-blue-700',
      'in_progress': 'bg-purple-100 text-purple-700',
      'resolved': 'bg-emerald-100 text-emerald-700',
      'confirmed': 'bg-gray-100 text-gray-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-600';
  };

  const reportTypeOptions = [
    { value: 'open', label: 'Open/Uncovered Manhole', icon: '🕳️' },
    { value: 'lost', label: 'Lost/Missing Cover', icon: '❌' },
    { value: 'hidden', label: 'Hidden/Obstructed', icon: '🌿' },
    { value: 'damaged', label: 'Damaged Cover', icon: '💔' },
  ];

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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Report Manhole Issues</h1>
        <p className="text-gray-500 mt-1">Help keep your community safe by reporting manhole problems</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Reports</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{allManholeReports.length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {allManholeReports.filter(r => r.status === 'pending' || r.status === 'assigned').length}
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
                {allManholeReports.filter(r => r.status === 'resolved' || r.status === 'confirmed').length}
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
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">New Report</h2>
                  <p className="text-sm text-gray-500">Submit a manhole issue</p>
                </div>
              </div>
            </div>

            <form onSubmit={reportManhole} className="p-6 space-y-4">
              {/* Area Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Area *</label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={loadingAreas}
                >
                  <option value="">
                    {loadingAreas ? 'Loading areas...' : 'Select an area'}
                  </option>
                  {areas.map((area) => (
                    <option key={area.area_id} value={area.area_id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Issue Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {reportTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Street Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Street Number / Address</label>
                <input
                  type="text"
                  value={streetNumber}
                  onChange={(e) => setStreetNumber(e.target.value)}
                  placeholder="e.g., 123 Main Street"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Nearby Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nearby Location / Landmark</label>
                <input
                  type="text"
                  value={nearbyLocation}
                  onChange={(e) => setNearbyLocation(e.target.value)}
                  placeholder="e.g., Near ABC Mall, opposite XYZ Bank"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Any other details about the issue..."
                  rows="2"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photo Evidence *</label>
                {!selectedImagePreview ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-500">Click to upload photo</p>
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
                className="w-full py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
                    Report Issue
                  </>
                )}
              </button>
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
              {allManholeReports.length === 0 ? (
                <NoDataDisplay emptyText="No manhole issues reported yet" />
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {allManholeReports.map((report) => (
                    <div
                      key={report.report_id}
                      className="bg-gradient-to-br from-white to-orange-50/30 border border-orange-100 rounded-xl p-5"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(report.status)}`}>
                            {report.status}
                          </span>
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                            {getReportTypeLabel(report.report_type)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Area</p>
                          <p className="font-medium text-gray-800">{report.area_name || 'N/A'}</p>
                        </div>
                        {report.company_name && (
                          <div>
                            <p className="text-sm text-gray-500">Assigned Company</p>
                            <p className="font-medium text-gray-800">{report.company_name}</p>
                          </div>
                        )}
                        {report.street_number && (
                          <div>
                            <p className="text-sm text-gray-500">Street Address</p>
                            <p className="font-medium text-gray-800">{report.street_number}</p>
                          </div>
                        )}
                        {report.nearby_location && (
                          <div>
                            <p className="text-sm text-gray-500">Nearby Location</p>
                            <p className="font-medium text-gray-800">{report.nearby_location}</p>
                          </div>
                        )}
                        {report.description && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-500">Description</p>
                            <p className="text-gray-700">{report.description}</p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {report.before_img && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Reported Image</p>
                            <img
                              src={report.before_img}
                              alt="Manhole Issue"
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        )}
                        {report.after_img && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Resolution Image</p>
                            <img
                              src={report.after_img}
                              alt="Fixed Manhole"
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        )}
                      </div>

                      {report.status === "resolved" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateManholeStatus(report.report_id, "confirmed")}
                            className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors text-sm flex items-center justify-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Confirm Fixed
                          </button>
                          <button
                            onClick={() => updateManholeStatus(report.report_id, "assigned")}
                            className="flex-1 py-2 border border-amber-500 text-amber-600 rounded-lg font-medium hover:bg-amber-50 transition-colors text-sm flex items-center justify-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Reopen
                          </button>
                        </div>
                      )}
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

export default ReportManhole;
