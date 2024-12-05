'use client';
import { useEffect, useState } from 'react';
import { Building2, FileText, Trash2, DollarSign, Search } from 'lucide-react';
import DashboardCard from "../components/admin_panel/dashboard";
import ComplaintsTable from "../components/admin_panel/Reports";
import RewardConversionRequests from "../components/admin_panel/RewardConversionRequests";
import ResignAgreements from "../components/admin_panel/ResignAgreements";
import AreaApprovalRequests from "../components/admin_panel/AreaApprovalRequests";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [companiesCount, setCompaniesCount] = useState(0);
  const [agreementsCount, setAgreementsCount] = useState(0);
  const [transactionsCount, setTransactionsCount] = useState(0);
  const [totalEquivalentPkr, setTotalEquivalentPkr] = useState(0);
  const [complaintsCount, setComplaintsCount] = useState(0);
  const [loading, setLoading] = useState(true); // State to track loading status

  // Function to fetch total number of companies
  const fetchCompaniesCount = async () => {
    try {
      const response = await fetch('/api/admin/get_total_companies/');
      const data = await response.json();
      return data.success ? data.data.length : 0;
    } catch (error) {
      console.error('Error fetching companies:', error);
      return 0;
    }
  };

  // Function to fetch total number of agreements
  const fetchAgreementsCount = async () => {
    try {
      const response = await fetch('/api/admin/get_all_agreements/');
      const data = await response.json();
      return data.success ? data.data.length : 0;
    } catch (error) {
      console.error('Error fetching agreements:', error);
      return 0;
    }
  };

  // Function to fetch total approved transactions and total equivalent_pkr this month
  const fetchApprovedTransactionsWithTotal = async () => {
    try {
      const response = await fetch('/api/admin/get_current_month_transactions/');
      const data = await response.json();
      if (data.success) {
        const transactionsCount = data.data.length;
        const totalEquivalentPkr = data.data.reduce((total, transaction) => {
          const equivalentPkrValue = parseFloat(transaction.equivalent_pkr);
          return !isNaN(equivalentPkrValue) ? total + equivalentPkrValue : total;
        }, 0);
        return { transactionsCount, totalEquivalentPkr };
      } else {
        return { transactionsCount: 0, totalEquivalentPkr: 0 };
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return { transactionsCount: 0, totalEquivalentPkr: 0 };
    }
  };

  // Function to fetch total number of complaints this month
  const fetchComplaintsCount = async () => {
    try {
      const response = await fetch('/api/admin/get_current_month_complaints/');
      const data = await response.json();
      return data.success ? data.data.length : 0;
    } catch (error) {
      console.error('Error fetching complaints:', error);
      return 0;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Set loading to true before fetching data

      const companies = await fetchCompaniesCount();
      const agreements = await fetchAgreementsCount();
      const { transactionsCount, totalEquivalentPkr } = await fetchApprovedTransactionsWithTotal();
      const complaints = await fetchComplaintsCount();

      setCompaniesCount(companies);
      setAgreementsCount(agreements);
      setTransactionsCount(transactionsCount);
      setTotalEquivalentPkr(totalEquivalentPkr);
      setComplaintsCount(complaints);

      setLoading(false); // Set loading to false once data is fetched
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader border-t-[custom-green] w-12 h-12 border-4 border-gray-300 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white text-custom-green">
      {/* Sidebar */}
      <aside className="w-64 bg-white text-custom-black border-r">
        <div className="p-4">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        <nav className="mt-4">
          <ul className="space-y-2">
            {["Dashboard", "Complaints", "Reward conversion requests", "Resign agreements", "Area approval requests"].map((tab) => (
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

        {activeTab === "Reward conversion requests" && (
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
