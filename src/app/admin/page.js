'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, FileText, Trash2, DollarSign } from 'lucide-react'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="flex h-screen bg-[#0e1b11] text-[#17cf42]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0e1b11] border-r border-[#17cf42]">
        <div className="p-4">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        <nav className="mt-4">
          <TabsList className="flex flex-col w-full">
            <TabsTrigger value="dashboard" onClick={() => setActiveTab('dashboard')} className="justify-start p-3 text-left text-[#17cf42] hover:bg-[#17cf42] hover:text-[#0e1b11] data-[state=active]:bg-[#17cf42] data-[state=active]:text-[#0e1b11]">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="companies" onClick={() => setActiveTab('companies')} className="justify-start p-3 text-left text-[#17cf42] hover:bg-[#17cf42] hover:text-[#0e1b11] data-[state=active]:bg-[#17cf42] data-[state=active]:text-[#0e1b11]">
              <Building2 className="mr-2 h-4 w-4" />
              Companies
            </TabsTrigger>
            <TabsTrigger value="agreements" onClick={() => setActiveTab('agreements')} className="justify-start p-3 text-left text-[#17cf42] hover:bg-[#17cf42] hover:text-[#0e1b11] data-[state=active]:bg-[#17cf42] data-[state=active]:text-[#0e1b11]">
              <FileText className="mr-2 h-4 w-4" />
              Agreements
            </TabsTrigger>
            <TabsTrigger value="missed-pickups" onClick={() => setActiveTab('missed-pickups')} className="justify-start p-3 text-left text-[#17cf42] hover:bg-[#17cf42] hover:text-[#0e1b11] data-[state=active]:bg-[#17cf42] data-[state=active]:text-[#0e1b11]">
              <Trash2 className="mr-2 h-4 w-4" />
              Missed Pick-Ups
            </TabsTrigger>
            <TabsTrigger value="transactions" onClick={() => setActiveTab('transactions')} className="justify-start p-3 text-left text-[#17cf42] hover:bg-[#17cf42] hover:text-[#0e1b11] data-[state=active]:bg-[#17cf42] data-[state=active]:text-[#0e1b11]">
              <DollarSign className="mr-2 h-4 w-4" />
              Transactions
            </TabsTrigger>
          </TabsList>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <Tabs value={activeTab} className="space-y-4">
          <TabsContent value="dashboard">
            <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardCard title="Total Companies" value="24" icon={<Building2 className="h-4 w-4" />} />
              <DashboardCard title="Active Agreements" value="18" icon={<FileText className="h-4 w-4" />} />
              <DashboardCard title="Missed Pick-Ups (This Month)" value="37" icon={<Trash2 className="h-4 w-4" />} />
              <DashboardCard title="Total Transactions" value="$12,450" icon={<DollarSign className="h-4 w-4" />} />
            </div>
          </TabsContent>

          <TabsContent value="companies">
            <h2 className="text-2xl font-bold mb-4">Manage Companies</h2>
            <CompaniesTable />
          </TabsContent>

          <TabsContent value="agreements">
            <h2 className="text-2xl font-bold mb-4">Manage Agreements</h2>
            <AgreementsTable />
          </TabsContent>

          <TabsContent value="missed-pickups">
            <h2 className="text-2xl font-bold mb-4">Missed Pick-Ups</h2>
            <MissedPickupsTable />
          </TabsContent>

          <TabsContent value="transactions">
            <h2 className="text-2xl font-bold mb-4">Transactions Overview</h2>
            <TransactionsTable />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function DashboardCard({ title, value, icon }) {
  return (
    <Card className="bg-[#0e1b11] border border-[#17cf42]">
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
        <Input placeholder="Search companies..." className="max-w-sm bg-[#0e1b11] text-[#17cf42] border-[#17cf42] focus:border-[#17cf42] focus:ring-[#17cf42]" />
        <Button className="bg-[#17cf42] text-[#0e1b11] hover:bg-[#0e1b11] hover:text-[#17cf42] hover:border-[#17cf42] hover:border">Add New Company</Button>
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
                <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                <Button variant="outline" size="sm">Delete</Button>
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
        <Input placeholder="Search agreements..." className="max-w-sm bg-[#0e1b11] text-[#17cf42] border-[#17cf42] focus:border-[#17cf42] focus:ring-[#17cf42]" />
        <Button className="bg-[#17cf42] text-[#0e1b11] hover:bg-[#0e1b11] hover:text-[#17cf42] hover:border-[#17cf42] hover:border">Add New Agreement</Button>
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
                <Button variant="outline" size="sm" className="mr-2">View</Button>
                <Button variant="outline" size="sm">Edit</Button>
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
        <Input placeholder="Search missed pick-ups..." className="max-w-sm bg-[#0e1b11] text-[#17cf42] border-[#17cf42] focus:border-[#17cf42] focus:ring-[#17cf42]" />
        <Button className="bg-[#17cf42] text-[#0e1b11] hover:bg-[#0e1b11] hover:text-[#17cf42] hover:border-[#17cf42] hover:border">Report New Missed Pick-Up</Button>
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
                <Button variant="outline" size="sm" className="mr-2">Update Status</Button>
                <Button variant="outline" size="sm">View Details</Button>
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
        <Input placeholder="Search transactions..." className="max-w-sm bg-[#0e1b11] text-[#17cf42] border-[#17cf42] focus:border-[#17cf42] focus:ring-[#17cf42]" />
        <Button className="bg-[#17cf42] text-[#0e1b11] hover:bg-[#0e1b11] hover:text-[#17cf42] hover:border-[#17cf42] hover:border">Generate Report</Button>
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
                <Button variant="outline" size="sm">View Details</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}