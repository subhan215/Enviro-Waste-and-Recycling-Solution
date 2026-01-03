import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Loader from "../ui/Loader";
import NoDataHappyFace from "../animations/noDataHappyFace";
import Alert from '../ui/Alert';

const Manhole_Reports = () => {
  const [manholeReports, setManholeReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState(null);
  const [selectedReportId, setSelectedReportId] = useState(null);
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
    const fetchManholeReports = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/manhole/get_all_for_company/${companyId}`
        );
        setManholeReports(response.data.data);
      } catch {
        setError("Failed to load manhole reports.");
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };
    fetchManholeReports();
  }, [companyId]);

  const handleImageChange = (e, reportId) => {
    const file = e.target.files[0];
    setSelectedImage(file);
    setSelectedReportId(reportId);

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImagePreview(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const markAsResolved = async (reportId) => {
    if (!selectedImage || selectedReportId !== reportId) {
      showAlert("warning", "Please select an image showing the fixed manhole.");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("company_id", companyId);
    formData.append("report_id", reportId);
    formData.append("after_image", selectedImage);

    try {
      const response = await axios.put(
        `/api/manhole/resolve`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.success) {
        setManholeReports((prevReports) =>
          prevReports.map((report) =>
            report.report_id === reportId
              ? { ...report, status: "resolved" }
              : report
          )
        );
        showAlert("success", "Manhole report marked as resolved.");
        setSelectedImage(null);
        setSelectedImagePreview(null);
        setSelectedReportId(null);
      } else {
        showAlert("error", response.data.message || "Resolution failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      showAlert("error", "Failed to update the status of the manhole report.");
    } finally {
      setSubmitting(false);
    }
  };

  const getReportTypeInfo = (type) => {
    switch (type) {
      case 'lost': return { label: 'Lost/Missing Cover', color: 'red', icon: '🚫' };
      case 'open': return { label: 'Open/Uncovered', color: 'orange', icon: '⚠️' };
      case 'hidden': return { label: 'Hidden/Obstructed', color: 'yellow', icon: '🔍' };
      case 'damaged': return { label: 'Damaged Cover', color: 'purple', icon: '💔' };
      default: return { label: type, color: 'gray', icon: '📋' };
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending': return { label: 'Pending', color: 'yellow' };
      case 'assigned': return { label: 'Assigned', color: 'blue' };
      case 'in_progress': return { label: 'In Progress', color: 'purple' };
      case 'resolved': return { label: 'Awaiting Confirmation', color: 'emerald' };
      case 'confirmed': return { label: 'Confirmed', color: 'green' };
      default: return { label: status, color: 'gray' };
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

  const activeCount = manholeReports.filter(r => r.status === 'assigned' || r.status === 'in_progress').length;
  const resolvedCount = manholeReports.filter(r => r.status === 'resolved').length;

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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Manhole Reports</h1>
        <p className="text-gray-500 mt-1">Manage and resolve manhole issues in your areas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Reports</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{manholeReports.length}</p>
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
              <p className="text-sm text-gray-500 font-medium">Active</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{activeCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Awaiting Confirmation</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{resolvedCount}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Manhole Issues</h2>
              <p className="text-sm text-gray-500">Upload resolution photo to mark as fixed</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {manholeReports.length === 0 ? (
            <div className="py-8">
              <NoDataHappyFace emptyText="No manhole reports assigned" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {manholeReports.map((report) => {
                const date = new Date(report.created_at);
                const formattedDate = date.toLocaleDateString();
                const formattedTime = date.toLocaleTimeString();
                const typeInfo = getReportTypeInfo(report.report_type);
                const statusInfo = getStatusInfo(report.status);
                const canResolve = report.status === "assigned" || report.status === "in_progress";

                return (
                  <div
                    key={report.report_id}
                    className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    {/* Card Header */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-lg">
                            {typeInfo.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{report.area_name}</h3>
                            <p className="text-xs text-gray-500">{formattedDate} at {formattedTime}</p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            statusInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                            statusInfo.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                            statusInfo.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                            statusInfo.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                            statusInfo.color === 'green' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>

                      {/* Report Type Badge */}
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          typeInfo.color === 'red' ? 'bg-red-100 text-red-700' :
                          typeInfo.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                          typeInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                          typeInfo.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {typeInfo.label}
                        </span>
                      </div>

                      {/* Reporter Info */}
                      <div className="mt-3 text-sm text-gray-600 space-y-1">
                        <p><span className="text-gray-400">Reported by:</span> {report.user_name}</p>
                        {report.street_number && (
                          <p><span className="text-gray-400">Street:</span> {report.street_number}</p>
                        )}
                        {report.nearby_location && (
                          <p><span className="text-gray-400">Nearby:</span> {report.nearby_location}</p>
                        )}
                        {report.description && (
                          <p><span className="text-gray-400">Note:</span> {report.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Before Image */}
                    {report.before_img && !(selectedImagePreview && selectedReportId === report.report_id) && (
                      <div className="relative">
                        <img
                          src={report.before_img}
                          alt="Reported Issue"
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-red-600 text-white text-xs rounded-lg">
                          Before
                        </div>
                      </div>
                    )}

                    {/* After Image (if resolved) */}
                    {report.after_img && (
                      <div className="relative">
                        <img
                          src={report.after_img}
                          alt="Fixed"
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-emerald-600 text-white text-xs rounded-lg">
                          After
                        </div>
                      </div>
                    )}

                    {/* Preview Section */}
                    {selectedImagePreview && selectedReportId === report.report_id && (
                      <div className="relative">
                        <img
                          src={selectedImagePreview}
                          alt="Your Upload"
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-emerald-600 text-white text-xs rounded-lg">
                          Resolution Photo
                        </div>
                        <button
                          onClick={() => {
                            setSelectedImage(null);
                            setSelectedImagePreview(null);
                            setSelectedReportId(null);
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
                    {canResolve && (
                      <div className="p-4 space-y-3">
                        <label
                          htmlFor={`file-input-${report.report_id}`}
                          className="flex items-center justify-center gap-2 w-full py-2.5 bg-orange-50 text-orange-700 rounded-xl cursor-pointer hover:bg-orange-100 transition-colors border border-orange-200"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium text-sm">Upload Resolution Photo</span>
                          <input
                            id={`file-input-${report.report_id}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, report.report_id)}
                            className="hidden"
                          />
                        </label>

                        <button
                          onClick={() => markAsResolved(report.report_id)}
                          disabled={submitting || !selectedImage || selectedReportId !== report.report_id}
                          className={`w-full py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                            selectedImage && selectedReportId === report.report_id
                              ? 'bg-orange-500 text-white hover:bg-orange-600'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {submitting && selectedReportId === report.report_id ? (
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
                              Mark as Resolved
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {!canResolve && report.status !== 'confirmed' && (
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

export default Manhole_Reports;
