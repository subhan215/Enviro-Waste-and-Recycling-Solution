import { useEffect, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import axios from "axios";
import Alert from '../ui/Alert'
import Admin_loader from "../ui/Admin_loader"

function ComplaintsTable() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
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
        //alert(response.data.message || "Reports fetched successfully!");
        showAlert('success' , 'Reports fetched successfully!')
      } catch {
        //console.error("Error fetching reports:", error);
        //alert(error.response?.data?.message || "Failed to fetch reports.");
        showAlert('error' , 'Failed to fetch reports')
        
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
        //alert("Report marked as resolved successfully!");
        showAlert('success' , 'Report marked as resolved successfully!')
      }
    } catch {
      //console.error("Error marking report as resolved:", error);
      //alert(error.response?.data?.message || "Failed to mark report as resolved.");
      showAlert('error' , 'Failed to mark report as resolved')
    }
  };

  const removeCompany = async (company_id) => {
    try {
      await axios.post("/api/report/remove_company_agreement", { company_id });
      setComplaints(complaints.filter(complaint => complaint.company_id !== company_id));
      //alert(response.data.message || "Company agreement removed successfully!");
      showAlert('success' , 'Company agreement removed successfully!')
    } catch  {
      //console.error("Error removing company:", error);
      //alert(error.response?.data?.message || "Failed to remove company agreement.");
      showAlert('error' , 'Failed to remove company agreement')
    
    }
  };

  // Filter complaints to exclude resolved ones
  const filteredComplaints = complaints?.filter(
    (complaint) => complaint.status !== true
  );

  if (loading) {
    return <Admin_loader></Admin_loader>
  }

  if (filteredComplaints?.length === 0) {
    // No data, show animation
    return (
    <>
    {alert.map((alert) => (
        <Alert
          key={alert.id}
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert((alert) => alert.filter((a) => a.id !== alert.id))}
        />
      ))}    
    </>
    );
  }

  return (
<div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-8 max-w-full">
  {filteredComplaints?.map((complaint) => (
    <div key={complaint.report_id} className="relative p-8 border rounded-lg shadow-lg bg-gray-50 hover:shadow-xl transition duration-300 ease-in-out w-full max-w-[500px] mx-auto">
      <p className="text-gray-700 text-xs sm:text-sm md:text-sm lg:text-base mb-2">
        User Name/Id: <span className="font-semibold">{complaint.name} / {complaint.user_id}</span>
      </p>
      <p className="text-gray-700 text-xs sm:text-sm md:text-sm lg:text-base mb-2">
        Description: {complaint.description}
      </p>
      <p className="text-gray-700 text-xs sm:text-sm md:text-sm lg:text-base mb-2">
        Sentiment Rating: <span className="font-semibold">{complaint.sentiment_rating}</span>
      </p>
      <p className="text-gray-700 text-xs sm:text-sm md:text-sm lg:text-base mb-4">
        Company Name: {complaint.company_name}
      </p>
      {alert.map((alert) => (
        <Alert
          key={alert.id}
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert((alert) => alert.filter((a) => a.id !== alert.id))}
        />
      ))}

      {/* Icons Section at Top Right */}
      <div className="absolute top-2 right-2 flex flex-col items-end gap-2">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:text-green-700"
          onClick={() => markAsResolved(complaint.report_id)}
        >
          <CheckCircle className="h-6 w-6" />
         
        </div>

        <div 
          className="flex items-center gap-2 cursor-pointer hover:text-red-700"
          onClick={() => removeCompany(complaint.company_id)}
        >
          <XCircle className="h-6 w-6" />
          
        </div>
      </div>
    </div>
  ))}
</div>
     
  );
}

export default ComplaintsTable;
