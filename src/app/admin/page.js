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

  return (
    <div className="flex h-screen bg-white text-[#17cf42]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#17cf42]">
        <div className="p-4">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        <nav className="mt-4">
          <TabsList className="flex flex-col w-full">
            <TabsTrigger value="dashboard" onClick={() => setActiveTab('dashboard')} className="justify-start p-3 text-left text-[#17cf42] hover:bg-[#17cf42] hover:text-white data-[state=active]:bg-[#17cf42] data-[state=active]:text-white">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="companies" onClick={() => setActiveTab('companies')} className="justify-start p-3 text-left text-[#17cf42] hover:bg-[#17cf42] hover:text-white data-[state=active]:bg-[#17cf42] data-[state=active]:text-white">
              <Building2 className="mr-2 h-4 w-4" />
              Companies
            </TabsTrigger>
            <TabsTrigger value="agreements" onClick={() => setActiveTab('agreements')} className="justify-start p-3 text-left text-[#17cf42] hover:bg-[#17cf42] hover:text-white data-[state=active]:bg-[#17cf42] data-[state=active]:text-white">
              <FileText className="mr-2 h-4 w-4" />
              Agreements
            </TabsTrigger>
            <TabsTrigger value="missed-pickups" onClick={() => setActiveTab('missed-pickups')} className="justify-start p-3 text-left text-[#17cf42] hover:bg-[#17cf42] hover:text-white data-[state=active]:bg-[#17cf42] data-[state=active]:text-white">
              <Trash2 className="mr-2 h-4 w-4" />
              Missed Pick-Ups
            </TabsTrigger>
            <TabsTrigger value="transactions" onClick={() => setActiveTab('transactions')} className="justify-start p-3 text-left text-[#17cf42] hover:bg-[#17cf42] hover:text-white data-[state=active]:bg-[#17cf42] data-[state=active]:text-white">
              <DollarSign className="mr-2 h-4 w-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="complaints" onClick={() => setActiveTab('complaints')} className="justify-start p-3 text-left text-[#17cf42] hover:bg-[#17cf42] hover:text-white data-[state=active]:bg-[#17cf42] data-[state=active]:text-white">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Complaints
            </TabsTrigger>
          </TabsList>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <Tabs value={activeTab} className="space-y-4">
          <TabsContent value="dashboard">
            <h2 className="text-2xl font-bold mb-4 text-[#17cf42]">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardCard title="Total Companies" value="24" icon={<Building2 className="h-4 w-4" />} />
              <DashboardCard title="Active Agreements" value="18" icon={<FileText className="h-4 w-4" />} />
              <DashboardCard title="Missed Pick-Ups (This Month)" value="37" icon={<Trash2 className="h-4 w-4" />} />
              <DashboardCard title="Total Transactions" value="$12,450" icon={<DollarSign className="h-4 w-4" />} />
            </div>
          </TabsContent>

          <TabsContent value="companies">
            <h2 className="text-2xl font-bold mb-4 text-[#17cf42]">Manage Companies</h2>
            <CompaniesTable />
          </TabsContent>

          <TabsContent value="agreements">
            <h2 className="text-2xl font-bold mb-4 text-[#17cf42]">Manage Agreements</h2>
            <AgreementsTable />
          </TabsContent>
          <TabsContent value="area_approval_requests">
            <h2 className="text-2xl font-bold mb-4 text-[#17cf42]">Manage Area Approval Requests</h2>
            <AreaApprovalRequests />
          </TabsContent>
          
          <TabsContent value="missed-pickups">
            <h2 className="text-2xl font-bold mb-4 text-[#17cf42]">Missed Pick-Ups</h2>
            <MissedPickupsTable />
          </TabsContent>

          <TabsContent value="transactions">
            <h2 className="text-2xl font-bold mb-4 text-[#17cf42]">Transactions Overview</h2>
            <TransactionsTable />
          </TabsContent>

          <TabsContent value="complaints">
            <h2 className="text-2xl font-bold mb-4 text-[#17cf42]">Citizen Complaints</h2>
            <ComplaintsTable searchTerm={searchTerm} setSearchTerm={setSearchTerm} statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
          </TabsContent>

        </Tabs>
      </main>
    </div>
  )
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

// function ComplaintsTable({ searchTerm, setSearchTerm, statusFilter, setStatusFilter }) {
//   const complaints = [
//     { id: 1, citizen: "John Doe", date: "2023-05-15", location: "123 Main St", type: "Missed Pickup", status: "Open" },
//     { id: 2, citizen: "Jane Smith", date: "2023-05-16", location: "456 Elm St", type: "Improper Disposal", status: "In Progress" },
//     { id: 3, citizen: "Bob Johnson", date: "2023-05-17", location: "789 Oak St", type: "Overflowing Bin", status: "Resolved" },
//     { id: 4, citizen: "Alice Brown", date: "2023-05-18", location: "101 Pine St", type: "Missed Pickup", status: "Open" },
//     { id: 5, citizen: "Charlie Davis", date: "2023-05-19", location: "202 Maple St", type: "Improper Disposal", status: "In Progress" },
//   ]

//   const filteredComplaints = complaints.filter(complaint => 
//     (complaint.citizen.toLowerCase().includes(searchTerm.toLowerCase()) ||
//      complaint.location.toLowerCase().includes(searchTerm.toLowerCase())) &&
//     (statusFilter === '' || complaint.status === statusFilter)
//   )

//   return (
//     <div>
//       <div className="flex justify-between items-center mb-4">
//         <div className="flex items-center space-x-2">
//           <Input
//             placeholder="Search by citizen or location"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-64 bg-white text-[#17cf42] border-[#17cf42] focus:border-[#17cf42] focus:ring-[#17cf42]"
//           />
//           <Search className="h-4 w-4 text-[#17cf42]" />
//         </div>
//         <Select value={statusFilter} onValueChange={setStatusFilter}>
//           <SelectTrigger className="w-[180px] border-[#17cf42] text-[#17cf42]">
//             <SelectValue placeholder="Filter by status" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="">All Statuses</SelectItem>
//             <SelectItem value="Open">Open</SelectItem>
//             <SelectItem value="In Progress">In Progress</SelectItem>
//             <SelectItem value="Resolved">Resolved</SelectItem>
//           </SelectContent>
//         </Select>
//         <Button className="bg-[#17cf42] text-white hover:bg-white hover:text-[#17cf42] hover:border-[#17cf42] hover:border">Add New Complaint</Button>
//       </div>
//       <Table className="border-[#17cf42]">
//         <TableHeader>
//           <TableRow className="border-b border-[#17cf42]">
//             <TableHead className="text-[#17cf42]">ID</TableHead>
//             <TableHead className="text-[#17cf42]">Citizen</TableHead>
//             <TableHead className="text-[#17cf42]">Date</TableHead>
//             <TableHead className="text-[#17cf42]">Location</TableHead>
//             <TableHead className="text-[#17cf42]">Type</TableHead>
//             <TableHead className="text-[#17cf42]">Status</TableHead>
//             <TableHead className="text-[#17cf42]">Actions</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {filteredComplaints.map((complaint) => (
//             <TableRow key={complaint.id} className="border-b border-[#17cf42]">
//               <TableCell className="text-[#17cf42]">{complaint.id}</TableCell>
//               <TableCell className="text-[#17cf42]">{complaint.citizen}</TableCell>
//               <TableCell className="text-[#17cf42]">{complaint.date}</TableCell>
//               <TableCell className="text-[#17cf42]">{complaint.location}</TableCell>
//               <TableCell className="text-[#17cf42]">{complaint.type}</TableCell>
//               <TableCell className="text-[#17cf42]">
//                 <div className="flex items-center">
//                   <AlertTriangle className={`h-4 w-4 mr-2 ${
//                     complaint.status === 'Open' ? 'text-red-500' :
//                     complaint.status === 'In Progress' ? 'text-yellow-500' :
//                     'text-green-500'
//                   }`} />
//                   {complaint.status}
//                 </div>
//               </TableCell>
//               <TableCell>
//                 <Button variant="outline" size="sm" className="mr-2 border-[#17cf42] text-[#17cf42] hover:bg-[#17cf42] hover:text-white">Update</Button>
//                 <Button variant="outline" size="sm" className="border-[#17cf42] text-[#17cf42] hover:bg-[#17cf42] hover:text-white">View</Button>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   )
// }

function ComplaintsTable({ searchTerm, setSearchTerm, statusFilter, setStatusFilter }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get("/api/report/get_all_reports");
        console.log("Response by get all reps : " , response.data.data);
        setComplaints(response.data.data);
        console.log("Complaints : ", complaints)
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const markAsResolved = async (reportId) => {
    try {
      await axios.post("/api/report/mark_as_resolved", { report_id: reportId });
      // Refresh the list of complaints after marking as resolved
      setComplaints(complaints.map(complaint => 
        complaint.id === reportId ? { ...complaint, status: "Resolved" } : complaint
      ));
    } catch (error) {
      console.error("Error marking report as resolved:", error);
    }
  };

  const removeCompany = async (company_id) => {
    try {
      await axios.post("/api/report/remove_company", { company_id: company_id });
      // Optionally remove the reports related to the company from the state
      setComplaints(complaints.filter(complaint => complaint.company_id !== company_id));
    } catch (error) {
      console.error("Error removing company:", error);
    }
  };

  // const filteredComplaints = complaints.filter(complaint =>
  //   (complaint.citizen.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //    complaint.location.toLowerCase().includes(searchTerm.toLowerCase())) &&
  //   (statusFilter === '' || complaint.status === statusFilter)
  // );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (complaints.length === 0) {
    return <div>No reports there.</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search by citizen or location"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 bg-white text-[#17cf42] border-[#17cf42] focus:border-[#17cf42] focus:ring-[#17cf42]"
          />
          <Search className="h-4 w-4 text-[#17cf42]" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] border-[#17cf42] text-[#17cf42]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Button className="bg-[#17cf42] text-white hover:bg-white hover:text-[#17cf42] hover:border-[#17cf42] hover:border">Add New Complaint</Button>
      </div>
      <Table className="border-[#17cf42]">
        <TableHeader>
          <TableRow className="border-b border-[#17cf42]">
            <TableHead className="text-[#17cf42]">Report ID</TableHead>
            <TableHead className="text-[#17cf42]">User Id</TableHead>
            <TableHead className="text-[#17cf42]">Description</TableHead>
            <TableHead className="text-[#17cf42]">Sentiment rating</TableHead>
            <TableHead className="text-[#17cf42]">Company Id</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {complaints.map((complaint) => (
            <TableRow key={complaint.id} className="border-b border-[#17cf42]">
              <TableCell className="text-[#17cf42]">{complaint.report_id}</TableCell>
              <TableCell className="text-[#17cf42]">{complaint.user_id}</TableCell>
              <TableCell className="text-[#17cf42]">{complaint.description}</TableCell>
              <TableCell className="text-[#17cf42]">{complaint.sentiment_rating}</TableCell>
              <TableCell className="text-[#17cf42]">{complaint.company_id}</TableCell>
              <TableCell className="text-[#17cf42]">
                <div className="flex items-center">
                  <AlertTriangle className={`h-4 w-4 mr-2 ${
                    complaint.status === 'Open' ? 'text-red-500' :
                    complaint.status === 'In Progress' ? 'text-yellow-500' :
                    'text-green-500'
                  }`} />
                  {complaint.status}
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  className="mr-2 border-[#17cf42] text-[#17cf42] hover:bg-[#17cf42] hover:text-white"
                  onClick={() => markAsResolved(complaint.report_id)}
                >
                  Mark as Resolved
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#17cf42] text-[#17cf42] hover:bg-[#17cf42] hover:text-white"
                  onClick={() => removeCompany(complaint.company_id)}
                >
                  Remove Company
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
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
      {requests.length > 0 ? (
        <ul>
          {requests.map((request) => (
            <li key={request.area_approval_id}>
              <div>
                <p>Area ID: {request.area_id}</p>
                <p>Company ID: {request.company_id}</p>
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