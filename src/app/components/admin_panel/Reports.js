import { useEffect, useState } from 'react';
import { Button } from "../ui/Button";
import { AlertTriangle } from 'lucide-react';
import axios from "axios";
import NoDataDisplay from "../animations/NoDataDisplay"; // Import the NoDataAnimation component

function ComplaintsTable({ searchTerm, setSearchTerm, statusFilter, setStatusFilter }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get("/api/report/get_all_reports");
        setComplaints(response.data.data);
        alert(response.data.message || "Reports fetched successfully!");
      } catch (error) {
        console.error("Error fetching reports:", error);
        alert(error.response?.data?.message || "Failed to fetch reports.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const markAsResolved = async (reportId) => {
    try {
      const response = await axios.post("/api/report/mark_as_resolved", { report_id: reportId });
      if (response.data.success) {
        setComplaints(complaints.map(complaint =>
          complaint.report_id === reportId ? { ...complaint, status: true } : complaint
        ));
        alert("Report marked as resolved successfully!");
      }
    } catch (error) {
      console.error("Error marking report as resolved:", error);
      alert(error.response?.data?.message || "Failed to mark report as resolved.");
    }
  };

  const removeCompany = async (company_id) => {
    try {
      const response = await axios.post("/api/report/remove_company_agreement", { company_id });
      setComplaints(complaints.filter(complaint => complaint.company_id !== company_id));
      alert(response.data.message || "Company agreement removed successfully!");
    } catch (error) {
      console.error("Error removing company:", error);
      alert(error.response?.data?.message || "Failed to remove company agreement.");
    }
  };

  // Filter complaints to exclude resolved ones
  const filteredComplaints = complaints?.filter(
    (complaint) => complaint.status !== true
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader border-t-[#17cf42] w-12 h-12 border-4 border-gray-300 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (filteredComplaints?.length === 0) {
    // No data, show animation
    return (
      <div className="flex justify-center items-center h-full">
        <NoDataDisplay emptyText='No reports available' /> {/* Pass message to the animation */}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-8 max-w-full">
  {filteredComplaints?.map((complaint) => (
    <div key={complaint.report_id} className="p-8 border rounded-lg shadow-lg bg-gray-50 hover:shadow-xl transition duration-300 ease-in-out w-full max-w-[500px] mx-auto">
      <p className="text-gray-700 text-sm mb-2">User Name/Id: <span className="font-semibold">{complaint.name} / {complaint.user_id}</span></p>
      <p className="text-gray-700 text-sm mb-2">Description: {complaint.description}</p>
      <p className="text-gray-700 text-sm mb-2">Sentiment Rating: <span className="font-semibold">{complaint.sentiment_rating}</span></p>
      <p className="text-gray-700 text-sm mb-4">Company Name: {complaint.company_name}</p>

      {/* Ensure buttons don't overflow */}
      <div className="mt-4 flex flex-wrap gap-4 justify-start">
        <Button
          variant="outline"
          size="sm"
          className="border-custom-green text-custom-green hover:bg-custom-green hover:text-white transition w-full sm:w-auto"
          onClick={() => markAsResolved(complaint.report_id)}
        >
          Mark as Resolved
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-custom-green text-custom-green hover:bg-custom-green hover:text-white transition w-full sm:w-auto"
          onClick={() => removeCompany(complaint.company_id)}
        >
          Terminate Agreement
        </Button>
      </div>
    </div>
  ))}
</div>

     
  );
}

export default ComplaintsTable;
