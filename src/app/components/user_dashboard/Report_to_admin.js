"use client";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Loader from "../ui/Loader";
import NoDataHappyFace from "../animations/noDataHappyFace";
import Alert from '../ui/Alert'
const Report_to_admin = () => {
  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState("");
  const [description, setDescription] = useState("");
  const [existingReports, setExistingReports] = useState([]);
  const [loading, setLoading] = useState(true);
 // const [error, setError] = useState(null);
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
      //setError(`Error fetching existing reports: ${err.message}`);
      console.error("Error fetching existing reports:", err);
    }
     };
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
        //setError(`Error fetching messages: ${err.message}`);
        console.error("Error fetching messages:", err);
      } 
    };
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchCompanies();
      await fetchExistingReports();
      await fetchMessages() ; 
      setLoading(false);
    };
    fetchData();
  }, [user_id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true)
    try {
      const response = await axios.post("/api/report/send_report", {
        user_id,
        company_id: companyId,
        description,
      });
      console.log(response)
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
  
        //alert("Reported successfully!");
        showAlert("success" , "Reported successfully!")
      } else {
        //setError("Failed to submit the report. Please try again.");
        showAlert("error" , "Failed to submit the report. Please try again.")
      }
    } catch {
      //setError(`Error submitting report: ${err.message}`);
      showAlert("error" , "Error submitting report")
    
    }
    finally{
      setLoading(false) ; 
    }
  };
  
  const handleMarkAsRead = async (reportId) => {
    try {
      const response = await axios.post("/api/report/mark_message_read", { report_id: reportId });
      console.log(response) ; 
      if(response.data.success) {
        setMessages((prev) => ({ ...prev, [reportId]: false }));
        setExistingReports((prev) =>
          prev.map((report) =>
            report.report_id === reportId ? { ...report, status: true } : report
          )
        );
      }
     
    } catch (err) {
      console.error("Error marking message as read:", err);
      //setError(`Error marking message as read: ${err.message}`);
    }
  };

  if (loading) {
    return <Loader></Loader>;
  }

  // Exclude companies for which reports already exist
  /*const availableCompanies = companies?.filter(
    (company) => !existingReports.some((report) => report.company_id === company.user_id)
  ); */

  return (
        <>
<div className="min-h-screen text-custom-black p-6">
  {alert.map((alert) => (
    <Alert
      key={alert.id}
      type={alert.type}
      message={alert.message}
      onClose={() => setAlert((alert) => alert.filter((a) => a.id !== alert.id))}
    />
  ))}  

  {/* Messages Section */}
  <div className="mb-8">
    <h2 className="sm:text-2xl md:text-3xl font-bold text-custom-black mb-4">Messages from Admin Panel</h2>
    {messages.length > 0 ? (
      <div>
        {messages.map((message) => (
          <div
            key={message.report_id}
            className="message-box bg-white text-black p-4 mb-4 rounded-lg shadow-md hover:scale-105 transition-all relative"
          >
            {/* Cross icon button at the top-right corner */}
            <button
              onClick={() => handleMarkAsRead(message.report_id)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
              &times; {/* This is the cross icon */}
            </button>
            <p>
              {message.message} against company -- <strong>{message.name}</strong>
            </p>
          </div>
        ))}
      </div>
    ) : (
      <p>No messages found</p>
    )}
  </div>

  {/* Existing Reports Section */}
  <div className="mb-8">
    <h3 className="sm:text-xl md:text-2xl font-semibold text-custom-black mb-4">Your Existing Reports</h3>
    {existingReports.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {existingReports.map((report) => (
          <div
            key={report.report_id}
            className="report-box bg-white text-black p-4 rounded-lg shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300"
            style={{ border: "1px solid #00ed64" }}
          >
            <p><strong>Company:</strong> {report.name}</p>
            <p><strong>Description:</strong> {report.description}</p>
          </div>
        ))}
      </div>
    ) : (
      <NoDataHappyFace emptyText="No existing Reports Found" />
    )}
  </div>

  {/* New Report Form Section */}
  <div>
    <h3 className="sm:text-xl md:text-2xl font-semibold text-custom-black mb-4">Submit a New Report</h3>
    {companies.length > 0 ? (
      <form onSubmit={handleSubmit} className="p-6 rounded-lg w-100">
        <div className="mb-4">
          <label htmlFor="companyId" className="block text-custom-black font-semibold mb-2">Select Company:</label>
          <select
            id="companyId"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            required
            className="w-full p-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="" disabled>-- Select a Company --</option>
            {companies.map((company) => (
              <option key={company.user_id} value={company.user_id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-custom-black font-semibold mb-2">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full p-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-[#00ED64] text-black border-2 border-white rounded-lg hover:bg-green-600 transition duration-300 ease-in-out"
        >
          Submit
        </button>
      </form>
    ) : (
      <p>All available companies have already been reported.</p>
    )}
  </div>
</div>

</>
  );
};

export default Report_to_admin;
