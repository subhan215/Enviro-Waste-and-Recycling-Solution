import { useEffect, useState } from "react";
import NoDataDisplay from "../animations/NoDataDisplay";
import Admin_loader from "../ui/Admin_loader";
import Alert from "../ui/Alert";

const AreaApprovalRequests = () => {
  const [requests, setRequests] = useState([]);
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

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/get_area_approval_requests");
      const data = await response.json();
      if (data.success) {
        setRequests(data.data);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching area approval requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (areaApprovalId) => {
    setProcessing(areaApprovalId);
    try {
      const response = await fetch("/api/admin/area_approval_requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ areaApprovalId }),
      });
      const data = await response.json();
      if (data.success) {
        showAlert("success", "Request approved successfully!");
        fetchRequests();
      } else {
        showAlert("info", data.message);
      }
    } catch (error) {
      console.error("Error approving request:", error);
      showAlert("error", "Failed to approve request");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (areaApprovalId) => {
    setProcessing(areaApprovalId);
    try {
      const response = await fetch("/api/admin/area_rejection_requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ areaApprovalId }),
      });
      const data = await response.json();
      if (data.success) {
        showAlert("warning", "Request rejected successfully!");
        fetchRequests();
      } else {
        showAlert("info", data.message);
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      showAlert("error", "Failed to reject request");
    } finally {
      setProcessing(null);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getServiceTypeConfig = (serviceType) => {
    switch (serviceType) {
      case "manhole_management":
        return { label: "Manhole Management", bgColor: "bg-orange-100", textColor: "text-orange-700", iconBg: "bg-orange-100", iconColor: "text-orange-600" };
      case "recycling":
        return { label: "Recycling", bgColor: "bg-blue-100", textColor: "text-blue-700", iconBg: "bg-blue-100", iconColor: "text-blue-600" };
      default:
        return { label: "Waste Collection", bgColor: "bg-emerald-100", textColor: "text-emerald-700", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" };
    }
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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Area Approval Requests</h1>
        <p className="text-gray-500 mt-1">Review and manage company service area requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Requests</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{requests?.length || 0}</p>
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
              <p className="text-sm text-gray-500 font-medium">Waste Collection</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {requests?.filter((r) => r.service_type === "waste_collection").length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Recycling</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {requests?.filter((r) => r.service_type === "recycling").length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Manhole Mgmt</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {requests?.filter((r) => r.service_type === "manhole_management").length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Pending Approvals</h2>
              <p className="text-sm text-gray-500">Review area service requests from companies</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {requests?.length === 0 ? (
            <div className="py-8">
              <NoDataDisplay emptyText="No area approval requests found" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map((request) => {
                const serviceConfig = getServiceTypeConfig(request.service_type);
                return (
                  <div
                    key={request.area_approval_id}
                    className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-5 hover:shadow-lg transition-all duration-300"
                  >
                    {/* Header with Service Type Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 ${serviceConfig.iconBg} rounded-xl flex items-center justify-center`}>
                          {request.service_type === "manhole_management" ? (
                            <svg className={`w-6 h-6 ${serviceConfig.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : request.service_type === "recycling" ? (
                            <svg className={`w-6 h-6 ${serviceConfig.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          ) : (
                            <svg className={`w-6 h-6 ${serviceConfig.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-lg text-gray-800">{request.name}</p>
                          <p className="text-sm text-gray-500">Area #{request.area_id}</p>
                        </div>
                      </div>
                    </div>

                    {/* Service Type Badge */}
                    <div className="mb-4">
                      <span className={`px-3 py-1 ${serviceConfig.bgColor} ${serviceConfig.textColor} text-sm font-medium rounded-full`}>
                        {serviceConfig.label}
                      </span>
                    </div>

                    {/* Company Info */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="text-gray-600">{request.company_name}</span>
                        <span className="text-gray-400">#{request.company_id}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(request.area_approval_id)}
                        disabled={processing === request.area_approval_id}
                        className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {processing === request.area_approval_id ? (
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(request.area_approval_id)}
                        disabled={processing === request.area_approval_id}
                        className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reject
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
};

export default AreaApprovalRequests;
