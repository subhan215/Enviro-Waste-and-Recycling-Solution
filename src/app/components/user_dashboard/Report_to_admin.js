"use client";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

const Report_to_admin = () => {
  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState("");
  const [description, setDescription] = useState("");
  const [existingReports, setExistingReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const userData = useSelector((state) => state.userData.value);
  const user_id = userData.user_id;

  console.log("In user ID : ", user_id);

  // Fetch companies available for reporting
  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`/api/report/get_companies_for_user_to_report/${user_id}`);
      console.log("Fetched Companies:", response.data.companies);
      if (response.data.companies) {
        setCompanies(response.data.companies);
      }
    } catch (err) {
     // setError(`Error fetching companies: ${err.message}`);
      console.error("Error fetching companies:", err);
    }
  };

  // Fetch all existing reports for the user
  const fetchExistingReports = async () => {
    try {
      const response = await axios.get(`/api/report/get_report/${user_id}`);
      console.log("Reports Response:", response);
      if (response.data && response.data.data) {
        setExistingReports(response.data.data);
      }
    } catch (err) {
      setError(`Error fetching existing reports: ${err.message}`);
      console.error("Error fetching existing reports:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchCompanies();
      await fetchExistingReports();
      setLoading(false);
    };

    fetchData();
  }, [user_id]);
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // Call the backend API to fetch the messages
        const response = await axios.get(`/api/report/get_report_messages/${user_id}`);
        console.log("Fetched Messages:", response.data.messages);

        if (response.data.messages) {
          setMessages(response.data.messages); // Store the messages in state
        } else {
          setError("No messages found.");
        }
      } catch (err) {
        setError(`Error fetching messages: ${err.message}`);
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);  // Stop loading after API call completes
      }
    };

    fetchMessages();
  }, [user_id]); 
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post("/api/report/send_report", {
        user_id,
        company_id: companyId,
        description,
      });
  
      // Check if the response is successful
      if (response.data.success) {
        // Add the new report to the existing reports
        setExistingReports([...existingReports, response.data.data]);
  
        // Update the companies list: Exclude the company that has been reported
        setCompanies((prevCompanies) =>
          prevCompanies.filter((company) => company.user_id !== response.data.data.company_id)
        );
  
        // Clear form fields
        setCompanyId("");
        setDescription("");
  
        alert("Reported successfully!");
      } else {
        setError("Failed to submit the report. Please try again.");
      }
    } catch (err) {
      setError(`Error submitting report: ${err.message}`);
    }
  };
  
  const handleMarkAsRead = async (reportId) => {
    try {
      await axios.post("/api/report/mark_message_read", { report_id: reportId });
      setShowMessages((prev) => ({ ...prev, [reportId]: false }));
      setExistingReports((prev) =>
        prev.map((report) =>
          report.report_id === reportId ? { ...report, status: true } : report
        )
      );
    } catch (err) {
      console.error("Error marking message as read:", err);
      setError(`Error marking message as read: ${err.message}`);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  // Exclude companies for which reports already exist
  /*const availableCompanies = companies?.filter(
    (company) => !existingReports.some((report) => report.company_id === company.user_id)
  ); */

  return (
    <div>
       <div>
      <h2>Messages from admin panel</h2>
      {messages.length > 0 ? (
        <div>
          {messages.map((message) => (
            <div key={message.report_id} className="message-box">
              <p>{message.message} against company -- <strong>{message.name}</strong> </p>
            </div>
          ))}
        </div>
      ) : (
        <p>No messages found.</p>
      )}
    </div>
      <h2>Report to Admin</h2>
      {error && <p className="text-red-500">{error}</p>}

      {/* Existing Reports Section */}
      <div>
        <h3>Your Existing Reports</h3>
        {existingReports.length > 0 ? (
          existingReports.map((report) => (
            <div key={report.report_id} className="report-box">
              <p><strong>Company:</strong> {report.name}</p>
              <p><strong>Description:</strong> {report.description}</p>
            </div>
          ))
        ) : (
          <p>No existing reports found.</p>
        )}
      </div>

      {/* New Report Form Section */}
      <div>
        <h3>Submit a New Report</h3>
        {companies.length > 0 ? (
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="companyId">Select Company:</label>
              <select
                id="companyId"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                required
              >
                <option value="" disabled>
                  -- Select a Company --
                </option>
                {companies.map((company) => (
                  <option key={company.user_id} value={company.user_id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <button type="submit">Submit</button>
          </form>
        ) : (
          <p>All available companies have already been reported.</p>
        )}
      </div>
    </div>
  );
};

export default Report_to_admin;
