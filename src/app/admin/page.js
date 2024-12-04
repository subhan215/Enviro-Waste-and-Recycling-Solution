'use client'
import { useEffect, useState } from 'react'
import {Button} from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader } from "../components/ui/Table"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/Select"
import { Building2, FileText, Trash2, DollarSign, Search, ChartNoAxesColumnDecreasing } from 'lucide-react'
import { AlertTriangle } from 'lucide-react'
import axios from "axios"
import { useRouter } from 'next/navigation'
export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [companiesCount, setCompaniesCount] = useState(0);
  const [agreementsCount, setAgreementsCount] = useState(0);
  const [transactionsCount, setTransactionsCount] = useState(0);
  const [totalEquivalentPkr, setTotalEquivalentPkr] = useState(0);
  const [complaintsCount, setComplaintsCount] = useState(0);
  // Function to fetch total number of companies
 const fetchCompaniesCount = async () => {
  try {
      const response = await fetch('/api/admin/get_total_companies/');  // Replace with the actual API endpoint
      const data = await response.json();

      if (data.success) {
          return data.data.length;  // Total number of companies
      } else {
          console.error('Failed to fetch companies:', data.message);
          return 0;
      }
  } catch (error) {
      console.error('Error fetching companies:', error);
      return 0;
  }
};
// Function to fetch total number of agreements
const fetchAgreementsCount = async () => {
  try {
      const response = await fetch('/api/admin/get_all_agreements/');  // Replace with the actual API endpoint
      const data = await response.json();

      if (data.success) {
          return data.data.length;  // Total number of agreements
      } else {
          console.error('Failed to fetch agreements:', data.message);
          return 0;
      }
  } catch (error) {
      console.error('Error fetching agreements:', error);
      return 0;
  }
};// Function to fetch total amount of approved transactions this month
// Function to fetch total approved transactions and total equivalent_pkr this month
const fetchApprovedTransactionsWithTotal = async () => {
  try {
      const response = await fetch('/api/admin/get_current_month_transactions/');  // Replace with the actual API endpoint
      const data = await response.json();

      if (data.success) {
          const transactionsCount = data.data.length;  // Total number of approved transactions this month
          let totalEquivalentPkr = data.data.reduce((total, transaction) => {
            const equivalentPkrValue = parseFloat(transaction.equivalent_pkr); // Convert to number
            return !isNaN(equivalentPkrValue) ? total + equivalentPkrValue : total; // Add to total if valid
        }, 0); // Initial total is 0
        

          return { transactionsCount, totalEquivalentPkr };
      } else {
          console.error('Failed to fetch transactions:', data.message);
          return { transactionsCount: 0, totalEquivalentPkr: 0 };
      }
  } catch (error) {
      console.error('Error fetching approved transactions:', error);
      return { transactionsCount: 0, totalEquivalentPkr: 0 };
  }
};
// Function to fetch total number of complaints this month
const fetchComplaintsCount = async () => {
  try {
      const response = await fetch('/api/admin/get_current_month_complaints/');  // Replace with the actual API endpoint
      const data = await response.json();

      if (data.success) {
          console.log(data.data)
          return data.data.length;  // Total number of complaints this month
      } else {
          console.error('Failed to fetch complaints:', data.message);
          return 0;
      }
  } catch (error) {
      console.error('Error fetching complaints:', error);
      return 0;
  }
};
useEffect(() => {
  const fetchData = async () => {
      const companies = await fetchCompaniesCount();
      const agreements = await fetchAgreementsCount();
      const { transactionsCount, totalEquivalentPkr } = await fetchApprovedTransactionsWithTotal();
      const complaints = await fetchComplaintsCount();

      setCompaniesCount(companies);
      setAgreementsCount(agreements);
      setTransactionsCount(transactionsCount);
      setTotalEquivalentPkr(totalEquivalentPkr);
      setComplaintsCount(complaints);
  };

  fetchData();
}, []);  // Empty depe

return (
  <div className="flex h-screen bg-white text-custom-green">
    {/* Sidebar */}
    <aside className="w-64 bg-white text-custom-black border-r">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>
      <nav className="mt-4">
        <ul className="space-y-2">
          {["Dashboard", "Complaints", "Reward coversion requests", "Resign agreements", "Area approval requests"].map((tab) => (
            <li key={tab}>
              <button
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left p-3 transition-colors ${
                  activeTab === tab
                    ? "bg-custom-green text-custom-black font-semibold"
                    : "hover:bg-custom-green "
                }`}
              >
                {tab.replace(/_/g, " ")}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>

    {/* Main content */}
    <main className="flex-1 p-8 bg-gray-50">
      {/* Conditionally render content based on activeTab */}
      {activeTab === "Dashboard" && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-custom-green">Dashboard Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardCard title="Total Companies" value={companiesCount} icon={<Building2 />} />
            <DashboardCard title="Active Agreements" value={agreementsCount} icon={<FileText />} />
            <DashboardCard title="Complaints (This Month)" value={complaintsCount} icon={<Trash2 />} />
            <DashboardCard title="Transactions (This Month)" value={transactionsCount} icon={<DollarSign />} />
            <DashboardCard title="Transactions Amount (This Month)" value={totalEquivalentPkr} icon={<DollarSign />} />
          </div>
        </div>
      )}

      {activeTab === "Complaints" && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-custom-green">Citizen Complaints</h2>
          <ComplaintsTable
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        </div>
      )}

      {activeTab === "Reward coversion requests" && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-custom-green">Reward Conversion Requests</h2>
          <RewardConversionRequests />
        </div>
      )}

      {activeTab === "Resign agreements" && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-custom-green">Resign Agreements Requests</h2>
          <ResignAgreements
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        </div>
      )}

      {activeTab === "Area approval requests" && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-custom-green">Manage Area Approval Requests</h2>
          <AreaApprovalRequests />
        </div>
      )}
    </main>
  </div>
);
}

function DashboardCard({ title, value, icon }) {
  return (
    <Card className="bg-white border border-[#17cf42]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-[#17cf42]">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-[#17cf42]">{value}</div>
      </CardContent>
    </Card>
  )
}

function CompaniesTable() {
  const companies = [
    { id: 1, name: 'EcoWaste Solutions', location: 'New York', status: 'Active' },
    { id: 2, name: 'GreenBin Inc.', location: 'Los Angeles', status: 'Active' },
    { id: 3, name: 'CleanCity Disposal', location: 'Chicago', status: 'Inactive' },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Input placeholder="Search companies..." className="max-w-sm bg-white text-[#17cf42] border-[#17cf42] focus:border-[#17cf42] focus:ring-[#17cf42]" />
        <Button className="bg-[#17cf42] text-white hover:bg-white hover:text-[#17cf42] hover:border-[#17cf42] hover:border">Add New Company</Button>
      </div>
      <Table className="border-[#17cf42]">
        <TableHeader>
          <TableRow className="border-b border-[#17cf42]">
            <TableHead className="text-[#17cf42]">ID</TableHead>
            <TableHead className="text-[#17cf42]">Name</TableHead>
            <TableHead className="text-[#17cf42]">Location</TableHead>
            <TableHead className="text-[#17cf42]">Status</TableHead>
            <TableHead className="text-[#17cf42]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id} className="border-b border-[#17cf42]">
              <TableCell className="text-[#17cf42]">{company.id}</TableCell>
              <TableCell className="text-[#17cf42]">{company.name}</TableCell>
              <TableCell className="text-[#17cf42]">{company.location}</TableCell>
              <TableCell className="text-[#17cf42]">{company.status}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" className="mr-2 border-[#17cf42] text-[#17cf42] hover:bg-[#17cf42] hover:text-white">Edit</Button>
                <Button variant="outline" size="sm" className="border-[#17cf42] text-[#17cf42] hover:bg-[#17cf42] hover:text-white">Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function AgreementsTable() {
  const agreements = [
    { id: 1, company: 'EcoWaste Solutions', startDate: '2023-01-01', endDate: '2024-01-01', status: 'Active' },
    { id: 2, company: 'GreenBin Inc.', startDate: '2023-03-15', endDate: '2024-03-15', status: 'Active' },
    { id: 3, company: 'CleanCity Disposal', startDate: '2022-06-01', endDate: '2023-06-01', status: 'Expired' },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Input placeholder="Search agreements..." className="max-w-sm bg-white text-[#17cf42] border-[#17cf42] focus:border-[#17cf42] focus:ring-[#17cf42]" />
        <Button className="bg-[#17cf42] text-white hover:bg-white hover:text-[#17cf42] hover:border-[#17cf42] hover:border">Add New Agreement</Button>
      </div>
      <Table className="border-[#17cf42]">
        <TableHeader>
          <TableRow className="border-b border-[#17cf42]">
            <TableHead className="text-[#17cf42]">ID</TableHead>
            <TableHead className="text-[#17cf42]">Company</TableHead>
            <TableHead className="text-[#17cf42]">Start Date</TableHead>
            <TableHead className="text-[#17cf42]">End Date</TableHead>
            <TableHead className="text-[#17cf42]">Status</TableHead>
            <TableHead className="text-[#17cf42]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agreements.map((agreement) => (
            <TableRow key={agreement.id} className="border-b border-[#17cf42]">
              <TableCell className="text-[#17cf42]">{agreement.id}</TableCell>
              <TableCell className="text-[#17cf42]">{agreement.company}</TableCell>
              <TableCell className="text-[#17cf42]">{agreement.startDate}</TableCell>
              <TableCell className="text-[#17cf42]">{agreement.endDate}</TableCell>
              <TableCell className="text-[#17cf42]">{agreement.status}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" className="mr-2 border-[#17cf42] text-[#17cf42] hover:bg-[#17cf42] hover:text-white">View</Button>
                <Button variant="outline" size="sm" className="border-[#17cf42] text-[#17cf42] hover:bg-[#17cf42] hover:text-white">Edit</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function MissedPickupsTable() {
  const missedPickups = [
    { id: 1, company: 'EcoWaste Solutions', date: '2023-05-15', location: '123 Main St', status: 'Resolved' },
    { id: 2, company: 'GreenBin Inc.', date: '2023-05-16', location: '456 Elm St', status: 'Pending' },
    { id: 3, company: 'CleanCity Disposal', date: '2023-05-17', location: '789 Oak St', status: 'Under Investigation' },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Input placeholder="Search missed pick-ups..." className="max-w-sm bg-white text-[#17cf42] border-[#17cf42] focus:border-[#17cf42] focus:ring-[#17cf42]" />
        <Button className="bg-[#17cf42] text-white hover:bg-white hover:text-[#17cf42] hover:border-[#17cf42] hover:border">Report New Missed Pick-Up</Button>
      </div>
      <Table className="border-[#17cf42]">
        <TableHeader>
          <TableRow className="border-b border-[#17cf42]">
            <TableHead className="text-[#17cf42]">ID</TableHead>
            <TableHead className="text-[#17cf42]">Company</TableHead>
            <TableHead className="text-[#17cf42]">Date</TableHead>
            <TableHead className="text-[#17cf42]">Location</TableHead>
            <TableHead className="text-[#17cf42]">Status</TableHead>
            <TableHead className="text-[#17cf42]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {missedPickups.map((pickup) => (
            <TableRow key={pickup.id} className="border-b border-[#17cf42]">
              <TableCell className="text-[#17cf42]">{pickup.id}</TableCell>
              <TableCell className="text-[#17cf42]">{pickup.company}</TableCell>
              <TableCell className="text-[#17cf42]">{pickup.date}</TableCell>
              <TableCell className="text-[#17cf42]">{pickup.location}</TableCell>
              <TableCell className="text-[#17cf42]">{pickup.status}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" className="mr-2 border-[#17cf42] text-[#17cf42] hover:bg-[#17cf42] hover:text-white">Update Status</Button>
                <Button variant="outline" size="sm" className="border-[#17cf42] text-[#17cf42] hover:bg-[#17cf42] hover:text-white">View Details</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function TransactionsTable() {
  const transactions = [
    { id: 1, company: 'EcoWaste Solutions', date: '2023-05-01', amount: '$5,000', type: 'Payment' },
    { id: 2, company: 'GreenBin Inc.', date: '2023-05-05', amount: '$3,500', type: 'Payment' },
    { id: 3, company: 'CleanCity Disposal', date: '2023-05-10', amount: '$500', type: 'Refund' },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Input placeholder="Search transactions..." className="max-w-sm bg-white text-[#17cf42] border-[#17cf42] focus:border-[#17cf42] focus:ring-[#17cf42]" />
        <Button className="bg-[#17cf42] text-white hover:bg-white hover:text-[#17cf42] hover:border-[#17cf42] hover:border">Generate Report</Button>
      </div>
      <Table className="border-[#17cf42]">
        <TableHeader>
          <TableRow className="border-b border-[#17cf42]">
            <TableHead className="text-[#17cf42]">ID</TableHead>
            <TableHead className="text-[#17cf42]">Company</TableHead>
            <TableHead className="text-[#17cf42]">Date</TableHead>
            <TableHead className="text-[#17cf42]">Amount</TableHead>
            <TableHead className="text-[#17cf42]">Type</TableHead>
            <TableHead className="text-[#17cf42]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id} className="border-b border-[#17cf42]">
              <TableCell className="text-[#17cf42]">{transaction.id}</TableCell>
              <TableCell className="text-[#17cf42]">{transaction.company}</TableCell>
              <TableCell className="text-[#17cf42]">{transaction.date}</TableCell>
              <TableCell className="text-[#17cf42]">{transaction.amount}</TableCell>
              <TableCell className="text-[#17cf42]">{transaction.type}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" className="border-[#17cf42] text-[#17cf42] hover:bg-[#17cf42] hover:text-white">View Details</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}


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
    return <div className="flex justify-center items-center h-full text-custom-green">Loading...</div>;
  }

  if (filteredComplaints?.length === 0) {
    return <div className="text-center text-custom-green">No reports available.</div>;
  }

  return (
    <div className="overflow-x-auto bg-white p-4 rounded-lg shadow-lg border border-custom-green">
      <Table className="min-w-full table-auto">
        <TableHeader>
          <TableRow className="bg-custom-green text-white">
            <TableHead className="px-4 py-2">Report ID</TableHead>
            <TableHead className="px-4 py-2">User ID</TableHead>
            <TableHead className="px-4 py-2">Description</TableHead>
            <TableHead className="px-4 py-2">Sentiment Rating</TableHead>
            <TableHead className="px-4 py-2">Company Name</TableHead>
            <TableHead className="px-4 py-2">Status</TableHead>
            <TableHead className="px-4 py-2">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredComplaints?.map((complaint) => (
            <TableRow key={complaint.report_id} className="border-b border-gray-200">
              <TableCell className="px-4 py-2 text-custom-green">{complaint.report_id}</TableCell>
              <TableCell className="px-4 py-2 text-custom-green">{complaint.user_id}</TableCell>
              <TableCell className="px-4 py-2 text-custom-green">{complaint.description}</TableCell>
              <TableCell className="px-4 py-2 text-custom-green">{complaint.sentiment_rating}</TableCell>
              <TableCell className="px-4 py-2 text-custom-green">{complaint.name}</TableCell>
              <TableCell className="px-4 py-2 text-custom-green">
                <div className="flex items-center">
                  <AlertTriangle
                    className={`h-4 w-4 mr-2 ${complaint.status === 'Open' ? 'text-red-500' : complaint.status === 'In Progress' ? 'text-yellow-500' : 'text-custom-green'}`}
                  />
                  {complaint.status}
                </div>
              </TableCell>
              <TableCell className="px-4 py-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="mr-2 border-custom-green text-custom-green hover:bg-custom-green hover:text-white transition"
                  onClick={() => markAsResolved(complaint.report_id)}
                >
                  Mark as Resolved
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-custom-green text-custom-green hover:bg-custom-green hover:text-white transition"
                  onClick={() => removeCompany(complaint.company_id)}
                >
                  Terminate Company Agreement
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

const AreaApprovalRequests = () => {
  const [requests, setRequests] = useState([]);

  // Fetch all area approval requests
  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/admin/get_area_approval_requests");
      const data = await response.json();
      console.log(data)
      if (data.success) {
        setRequests(data.data);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching area approval requests:", error);
    }
  };

  // Function to handle approval
  const handleApprove = async (areaApprovalId) => {
    try {
      const response = await fetch("/api/admin/area_approval_requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ areaApprovalId }),
      });
      const data = await response.json();
      if (data.success) {
        alert("Request approved successfully!");
        fetchRequests(); // Refresh the requests list
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div>
      <h1>Area Approval Requests</h1>
      {requests?.length > 0 ? (
        <ul>
          {requests.map((request) => (
            <li key={request.area_approval_id}>
              <div>
                <p>Area ID: {request.area_id}</p>
                <p>Company Name: {request.name}</p>
                <button onClick={() => handleApprove(request.area_approval_id)}>
                  Approve Request
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No area approval requests found.</p>
      )}
    </div>
  );
};

const RewardConversionRequests = () => {
  const [rewardConversions, setRewardConversions] = useState([]);

  useEffect(() => {
    async function fetchRewardConversions() {
      try {
        const response = await fetch("/api/admin/get_reward_conversion_requests");
        const data = await response.json();
        console.log(data)
        setRewardConversions(data.data);
      } catch (error) {
        console.error("Error fetching reward conversions:", error);
      }
    }

    fetchRewardConversions();
  }, []);

  // Handler for updating reward conversion status
  const handleAction = async (conversionId, status) => {
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
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error("Error updating reward conversion status:", error);
    }
  };

  return (
    <div>
      <Table className="border-[#17cf42]">
        <TableHeader>
          <TableRow className="border-b border-[#17cf42]">
            <TableHead className="text-[#17cf42]">User Name</TableHead>
            <TableHead className="text-[#17cf42]">User Email</TableHead>
            <TableHead className="text-[#17cf42]">Reward Amount</TableHead>
            <TableHead className="text-[#17cf42]">Equivalent PKR</TableHead>
            <TableHead className="text-[#17cf42]">Status</TableHead>
            <TableHead className="text-[#17cf42]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rewardConversions?.map((conversion) => (
            <TableRow
              key={conversion.conversion_id}
              className="border-b border-[#17cf42]"
            >
              <TableCell className="text-[#17cf42]">{conversion.name}</TableCell>
              <TableCell className="text-[#17cf42]">
                {conversion.email_id}
              </TableCell>
              <TableCell className="text-[#17cf42]">
                {conversion.conversion_amount}
              </TableCell>
              <TableCell className="text-[#17cf42]">
                {conversion.equivalent_pkr}
              </TableCell>
              <TableCell className="text-[#17cf42]">
                {conversion.status}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  className="mr-2 border-[#17cf42] text-[#17cf42] hover:bg-[#17cf42] hover:text-white"
                  onClick={() => handleAction(conversion.conversion_id, "Approved")}
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#17cf42] text-[#17cf42] hover:bg-[#17cf42] hover:text-white"
                  onClick={() => handleAction(conversion.conversion_id, "Rejected")}
                >
                  Reject
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const ResignAgreements = () => {
  const [pendingAgreements, setPendingAgreements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch the pending resignation agreements on component mount
  useEffect(() => {
    const fetchPendingAgreements = async () => {
      try {
        const response = await fetch("/api/admin/get_resign_agreements", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (data.success) {
          setPendingAgreements(data.data || []);
        } else {
          setPendingAgreements([]);
        }
      } catch (error) {
        console.error("Error fetching pending resignation agreements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingAgreements();
  }, []);

  // Function to handle action on an agreement (approve or reject)
  const handleAction = async (agreementId, action) => {
    try {
      const response = await fetch("/api/admin/approve_reject_resign_agreement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resign_id: agreementId,
          status: action, // either 'approve' or 'reject'
        }),
      });
  
      const data = await response.json();
      console.log(data)
      if (data.success) {
        // Remove the agreement from the list once it's successfully approved or rejected
        setPendingAgreements((prevAgreements) =>
          prevAgreements.filter((agreement) => agreement.resign_id !== agreementId)
        );
      } else {
        alert("Failed to update agreement status");
      }
    } catch (error) {
      console.error("Error updating agreement status:", error);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Loading...</p>
      </div>
    );
  }

  return (
<div className="min-h-screen flex bg-enviro-gray p-6">
  <div className="flex-grow bg-white shadow-md p-6 rounded-lg">
    <h2 className="text-3xl font-bold text-custom-green mb-6">Admin Panel - Pending Resignation Agreements</h2>
    {pendingAgreements.length === 0 ? (
      <p className="text-enviro-black">No pending resignation agreements found.</p>
    ) : (
      <div>
        <ul>
          {pendingAgreements.map((agreement) => (
            <li
              key={agreement.resign_id}
              className="mb-4 p-4 border-b border-enviro-green"
            >
              <h3 className="font-bold text-enviro-black">
                Resignation Request #{agreement.resign_id}
              </h3>
              <p className="text-enviro-black">
                Company ID: {agreement.company_id}
              </p>
              <p className="text-sm text-enviro-gray">
                Requested on: {new Date(agreement.created_at).toLocaleString()}
              </p>
              <p className="text-sm text-enviro-gray">
                Status: {agreement.status}
              </p>
              <div className="mt-4">
                <button
                  onClick={() => handleAction(agreement.resign_id, "approved")}
                  className="bg-enviro-green text-white py-2 px-4 rounded mr-2 hover:bg-enviro-green-dark transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(agreement.resign_id, "rejected")}
                  className="bg-enviro-red text-white py-2 px-4 rounded hover:bg-enviro-red-dark transition-colors"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
</div>



  );
};
