import { useEffect, useState } from "react";
import NoDataDisplay from "../animations/NoDataDisplay";
import Admin_loader from "../ui/Admin_loader";
import Alert from "../ui/Alert";

const RewardConversionRequests = () => {
  const [rewardConversions, setRewardConversions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
    async function fetchRewardConversions() {
      try {
        const response = await fetch("/api/admin/get_reward_conversion_requests");
        const data = await response.json();
        setRewardConversions(data.data || []);
      } catch (error) {
        console.error("Error fetching reward conversions:", error);
        showAlert("error", "Failed to fetch reward conversions");
      } finally {
        setIsLoading(false);
      }
    }
    fetchRewardConversions();
  }, []);

  const handleAction = async (conversionId, status) => {
    setProcessing(conversionId);
    try {
      const response = await fetch("/api/admin/reward_conversion_action", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversionId, status }),
      });
      const result = await response.json();
      if (result.success) {
        setRewardConversions((prev) =>
          prev.map((conversion) =>
            conversion.conversion_id === conversionId
              ? { ...conversion, status }
              : conversion
          )
        );
        showAlert("success", `Conversion ${status.toLowerCase()} successfully`);
      } else {
        showAlert("error", result.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating reward conversion status:", error);
      showAlert("error", "Failed to update conversion status");
    } finally {
      setProcessing(null);
    }
  };

  const pendingConversions = rewardConversions?.filter((c) => c.status === "Pending") || [];
  const totalPKR = pendingConversions.reduce((sum, c) => sum + (parseFloat(c.equivalent_pkr) || 0), 0);

  const getStatusConfig = (status) => {
    switch (status) {
      case "Approved":
        return { bg: "bg-emerald-100", text: "text-emerald-700" };
      case "Rejected":
        return { bg: "bg-red-100", text: "text-red-700" };
      default:
        return { bg: "bg-yellow-100", text: "text-yellow-700" };
    }
  };

  if (isLoading) return <Admin_loader />;

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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Reward Conversions</h1>
        <p className="text-gray-500 mt-1">Process user reward conversion requests to PKR</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Requests</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{rewardConversions?.length || 0}</p>
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
              <p className="text-2xl font-bold text-yellow-600 mt-1">{pendingConversions.length}</p>
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
              <p className="text-sm text-gray-500 font-medium">Approved</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {rewardConversions?.filter((c) => c.status === "Approved").length || 0}
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
              <p className="text-sm text-gray-500 font-medium">Pending PKR</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">Rs. {totalPKR.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Conversions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Conversion Requests</h2>
              <p className="text-sm text-gray-500">Approve or reject reward to PKR conversions</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {rewardConversions?.length === 0 ? (
            <div className="py-8">
              <NoDataDisplay emptyText="No reward conversion requests" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewardConversions.map((conversion) => {
                const statusConfig = getStatusConfig(conversion.status);
                return (
                  <div
                    key={conversion.conversion_id}
                    className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-5 hover:shadow-lg transition-all duration-300"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-bold text-lg text-gray-800">{conversion.name}</p>
                          <p className="text-sm text-gray-500 truncate max-w-[150px]">{conversion.email_id}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 ${statusConfig.bg} ${statusConfig.text} text-sm font-medium rounded-full`}>
                        {conversion.status}
                      </span>
                    </div>

                    {/* Conversion Details */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Reward Points</span>
                        <span className="font-bold text-gray-800">{conversion.conversion_amount}</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                        <span className="text-sm text-gray-500">Equivalent PKR</span>
                        <span className="font-bold text-emerald-600 text-lg">Rs. {conversion.equivalent_pkr}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {conversion.status === "Pending" && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAction(conversion.conversion_id, "Approved")}
                          disabled={processing === conversion.conversion_id}
                          className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {processing === conversion.conversion_id ? (
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
                          onClick={() => handleAction(conversion.conversion_id, "Rejected")}
                          disabled={processing === conversion.conversion_id}
                          className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Reject
                        </button>
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

export default RewardConversionRequests;
