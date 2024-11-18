"use client";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

const Report_to_admin = () => {
  const [companyId, setCompanyId] = useState("");
  const [description, setDescription] = useState("");
  const [existingReport, setExistingReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userData = useSelector((state) => state.userData.value)  
  //let user_id = 1; ////userData.user_id
  let user_id = userData.user_id;

  console.log("In user ID : ", user_id);
  

  useEffect(() => {
    // Fetch existing reports by user
    const fetchReports = async () => {
      try {
        const response = await axios.get(`/api/report/get_report/${user_id}/`);
        console.log("Report Response : ", response)
        if (response.data && response.data.data) {
          setExistingReport(response.data.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post("/api/report/send_report", {
        user_id,
        company_id : companyId,
        description,
      });
      setExistingReport(response.data.data);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (existingReport) {
    return (
      <div>
        <h2>Your Existing Report</h2>
        <p>Company ID: {existingReport.company_id}</p>
        <p>Description: {existingReport.description}</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Report to Admin</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="companyId">Company ID:</label>
          <input
            type="text"
            id="companyId"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            required
          />
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
    </div>
  );
};

export default Report_to_admin;