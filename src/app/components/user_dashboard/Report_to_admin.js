"use client";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Loader from "../ui/Loader";
import NoDataDisplay from "../animations/NoDataDisplay";
import Alert from '../ui/Alert';

const Report_to_admin = () => {
  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState("");
  const [description, setDescription] = useState("");
  const [existingReports, setExistingReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [messages, setMessages] = useState([]);
  const userData = useSelector((state) => state.userData.value);
  const user_id = userData.user_id;
  const [alert, setAlert] = useState([]);

  const showAlert = (type, message) => {
    const id = Date.now();
    setAlert([...alert, { id, type, message }]);
    setTimeout(() => {
      setAlert((alerts) => alerts.filter((alert) => alert.id !== id));
    }, 4000);
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`/api/report/get_companies_for_user_to_report/${user_id}`);
      if (response.data.companies) {
        setCompanies(response.data.companies);
      }
    } catch (err) {
      console.error("Error fetching companies:", err);
    }
  };

  const fetchExistingReports = async () => {
    try {
      const response = await axios.get(`/api/report/get_report/${user_id}`);
      if (response.data && response.data.data) {
        setExistingReports(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching existing reports:", err);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/api/report/get_report_messages/${user_id}`);
      if (response.data.messages) {
        setMessages(response.data.messages);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchCompanies();
      await fetchExistingReports();
      await fetchMessages();
      setLoading(false);
    };
    fetchData();
  }, [user_id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!companyId || !description.trim()) {
      showAlert("warning", "Please select a company and provide a description");
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post("/api/report/send_report", {
        user_id,
        company_id: companyId,
        description,
      });

      if (response.data.success) {
        setExistingReports([...existingReports, response.data.data]);
        setCompanies((prevCompanies) =>
          prevCompanies.filter((company) => company.user_id !== response.data.data.company_id)
        );
        setCompanyId("");
        setDescription("");
        showAlert("success", "Report submitted successfully!");
      } else {
        showAlert("error", "Failed to submit the report. Please try again.");
      }
    } catch {
      showAlert("error", "Error submitting report");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAsRead = async (reportId) => {
    try {
      const response = await axios.post("/api/report/mark_message_read", { report_id: reportId });
      if (response.data.success) {
        setMessages((prev) => prev.filter(m => m.report_id !== reportId));
        showAlert("success", "Message marked as read");
      }
    } catch (err) {
      console.error("Error marking message as read:", err);
    }
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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Report to Admin</h1>
        <p className="text-gray-500 mt-1">Submit complaints about service companies</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Reports</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{existingReports.length}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Unread Messages</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{messages.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Companies to Report</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{companies.length}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Messages */}
      {messages.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="border-b border-gray-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Messages from Admin</h2>
                <p className="text-sm text-gray-500">Responses to your reports</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-3">
            {messages.map((message) => (
              <div
                key={message.report_id}
                className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-4 relative"
              >
                <button
                  onClick={() => handleMarkAsRead(message.report_id)}
                  className="absolute top-3 right-3 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="flex items-start gap-3 pr-8">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-700">{message.message}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Regarding: <span className="font-medium text-gray-700">{message.name}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
            <div className="border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">New Report</h2>
                  <p className="text-sm text-gray-500">Submit a complaint</p>
                </div>
              </div>
            </div>

            {companies.length > 0 ? (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Company</label>
                  <select
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">-- Select a Company --</option>
                    {companies.map((company) => (
                      <option key={company.user_id} value={company.user_id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your complaint..."
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Submit Report
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-500">All available companies have been reported</p>
              </div>
            )}
          </div>
        </div>

        {/* Existing Reports */}
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
                  <p className="text-sm text-gray-500">Previous complaints submitted</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {existingReports.length === 0 ? (
                <NoDataDisplay emptyText="No reports submitted yet" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {existingReports.map((report) => (
                    <div
                      key={report.report_id}
                      className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-5 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 truncate">{report.name}</h3>
                          <p className="text-xs text-gray-500">Company</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600 line-clamp-3">{report.description}</p>
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

export default Report_to_admin;
