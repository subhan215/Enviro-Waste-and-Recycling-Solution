import { useEffect, useState } from "react";
import axios from "axios";
import Alert from "../ui/Alert";
import Admin_loader from "../ui/Admin_loader";
import NoDataDisplay from "../animations/NoDataDisplay";

function ComplaintsTable() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [alert, setAlert] = useState([]);

  const showAlert = (type, message) => {
    const id = Date.now();
    setAlert([...alert, { id, type, message }]);
    setTimeout(() => {
      setAlert((alerts) => alerts.filter((alert) => alert.id !== id));
    }, 4000);
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get("/api/report/get_all_reports");
        setComplaints(response.data.data);
      } catch {
        showAlert("error", "Failed to fetch reports");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const markAsResolved = async (reportId) => {
    setProcessing(reportId);
    try {
      const response = await axios.post("/api/report/mark_as_resolved", { report_id: reportId });
      if (response.data.success) {
        setComplaints(
          complaints.map((complaint) =>
            complaint.report_id === reportId ? { ...complaint, status: true } : complaint
          )
        );
        showAlert("success", "Report marked as resolved!");
      }
    } catch {
      showAlert("error", "Failed to mark report as resolved");
    } finally {
      setProcessing(null);
    }
  };

  const removeCompany = async (company_id, reportId) => {
    setProcessing(reportId);
    try {
      await axios.post("/api/report/remove_company_agreement", { company_id });
      setComplaints(complaints.filter((complaint) => complaint.company_id !== company_id));
      showAlert("success", "Company agreement removed!");
    } catch {
      showAlert("error", "Failed to remove company agreement");
    } finally {
      setProcessing(null);
    }
  };

  const filteredComplaints = complaints?.filter((complaint) => complaint.status !== true);

  const getSentimentConfig = (rating) => {
    if (rating >= 4) return { color: "text-emerald-600", bg: "bg-emerald-100", label: "Positive" };
    if (rating >= 2) return { color: "text-yellow-600", bg: "bg-yellow-100", label: "Neutral" };
    return { color: "text-red-600", bg: "bg-red-100", label: "Negative" };
  };

  if (loading) return <Admin_loader />;

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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">User Reports</h1>
        <p className="text-gray-500 mt-1">Review and manage user complaints against companies</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Reports</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{complaints?.length || 0}</p>
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
              <p className="text-2xl font-bold text-yellow-600 mt-1">{filteredComplaints?.length || 0}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                {complaints?.filter((c) => c.status === true).length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Critical</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {filteredComplaints?.filter((c) => c.sentiment_rating < 2).length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Pending Complaints</h2>
              <p className="text-sm text-gray-500">Review and take action on user complaints</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredComplaints?.length === 0 ? (
            <div className="py-8">
              <NoDataDisplay emptyText="No pending complaints to review" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredComplaints?.map((complaint) => {
                const sentimentConfig = getSentimentConfig(complaint.sentiment_rating);
                return (
                  <div
                    key={complaint.report_id}
                    className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-5 hover:shadow-lg transition-all duration-300"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-bold text-lg text-gray-800">{complaint.name}</p>
                          <p className="text-sm text-gray-500">User #{complaint.user_id}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 ${sentimentConfig.bg} ${sentimentConfig.color} text-sm font-medium rounded-full`}>
                        {complaint.sentiment_rating}/5
                      </span>
                    </div>

                    {/* Description */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-sm text-gray-600 line-clamp-3">{complaint.description}</p>
                      </div>
                    </div>

                    {/* Company Info */}
                    <div className="flex items-center gap-2 text-sm mb-4 pb-4 border-b border-gray-100">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-gray-600">Against: {complaint.company_name}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => markAsResolved(complaint.report_id)}
                        disabled={processing === complaint.report_id}
                        className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {processing === complaint.report_id ? (
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        Resolve
                      </button>
                      <button
                        onClick={() => removeCompany(complaint.company_id, complaint.report_id)}
                        disabled={processing === complaint.report_id}
                        className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Remove Company
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ComplaintsTable;
