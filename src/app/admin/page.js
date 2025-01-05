'use client';
import { useEffect, useState } from 'react';
import { Building2, FileText, Trash2, DollarSign} from 'lucide-react';
import DashboardCard from "../components/admin_panel/dashboard";
import ComplaintsTable from "../components/admin_panel/Reports";
import RewardConversionRequests from "../components/admin_panel/RewardConversionRequests";
import ResignAgreements from "../components/admin_panel/ResignAgreements";
import AreaApprovalRequests from "../components/admin_panel/AreaApprovalRequests";
import Admin_loader from "../components/ui/Admin_loader"
import RecyclingCenterRequests from "../components/admin_panel/RecyclingCenterRequests"
import SubmitMaterialRequests from "../components/admin_panel/SubmitMaterialRequests" ; 
export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOpen, setIsOpen] = useState(false);
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
    return <Admin_loader></Admin_loader>
  }

  return (
    <div className="relative min-h-screen flex bg-green-50">
      {/* Sidebar */}
      <>
      {/* Button to toggle sidebar */}
      <button
        className={`fixed z-30 left-0 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-custom-green text-white flex items-center justify-center rounded-r-full shadow-lg md:hidden ${
          isOpen ? "hidden" : "block"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        →
      </button>

      {/* Sidebar */}
      <aside style={{width: "250px", zIndex: 9999, borderRight: "1px solid black"}}
       className={`absolute top-0 left-0 min-h-screen bg-white shadow-lg border-r transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0  ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
      >
        <div className="p-4 flex w-full justify-between text-custom-black">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <button
          onClick={()=> setIsOpen(!isOpen)}
          className="text-xl font-bold text-custom-green md:hidden"
        >
          &times;
        </button>
        </div>
        <nav className="mt-4">
          <ul className="space-y-2">
            {["Dashboard", "Complaints", "Reward requests", "Resign agreements", "Area approval requests", "Recycling requests" , "Submit Material Requests"].map((tab) => (
              <li key={tab}>
                <button
                  onClick={() => setActiveTab(tab)}
                  className={`w-full text-left p-3 transition-colors text-custom-black ${
                    activeTab === tab
                      ? "bg-custom-green text-custom-black font-semibold"
                      : "hover:bg-custom-green"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                  {tab === "Dashboard" && (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
</svg>

          )}
          {tab === "Complaints" && (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 3.75v4.5m0-4.5h-4.5m4.5 0-6 6m3 12c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 0 1 4.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 0 0-.38 1.21 12.035 12.035 0 0 0 7.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 0 1 1.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 0 1-2.25 2.25h-2.25Z" />
</svg>

          )}
          {tab === "Reward requests" && (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
</svg>

          )}
          {tab === "Resign agreements" && (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>

          )}
          {tab === "Area approval requests" && (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
</svg>

          )}
                    {tab === "Recycling requests" && (
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
           <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
         </svg>

          )}
          {tab === "Submit Material Requests" && (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v12m0 0-3-3m3 3 3-3M6 18h12M6 18a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H6z" />
  </svg>
)}

                    {/* Insert your SVG icons here for each tab */}
                    <span>{tab.replace(/_/g, " ")}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
{/* Main content */}
<main className="flex-1 p-8 bg-green-50">
  {/* Conditionally render content based on activeTab */}
  {activeTab === "Dashboard" && (
    <div>
      <h2 className="text-xl sm:text-xl md:text-2xl font-bold mb-4 text-custom-black text-center">Dashboard Overview</h2>
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
      <h2 className="text-xl sm:text-xl md:text-2xl font-bold mb-4 text-custom-black text-center">Citizen Complaints</h2>
      <ComplaintsTable
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
    </div>
  )}

  {activeTab === "Reward requests" && (
    <div>
      <h2 className="text-xl sm:text-xl md:text-2xl font-bold mb-4 text-custom-black text-center">Reward Conversion Requests</h2>
      <RewardConversionRequests />
    </div>
  )}

  {activeTab === "Resign agreements" && (
    <div>
      <h2 className="text-xl sm:text-xl md:text-2xl font-bold mb-4 text-custom-black text-center">Resign Agreements Requests</h2>
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
      <h2 className="text-xl sm:text-xl md:text-2xl font-bold mb-4 text-custom-black text-center">Area Approval Requests</h2>
      <AreaApprovalRequests />
    </div>
  )}

  {activeTab === "Submit Material Requests" && (
    <div>
      <h2 className="text-xl sm:text-xl md:text-2xl font-bold mb-4 text-custom-black text-center">Submit Material Requests</h2>
      <SubmitMaterialRequests />
    </div>
  )}

  {activeTab === "Recycling requests" && (
    <div>
      <h2 className="text-xl sm:text-xl md:text-2xl font-bold mb-4 text-custom-black text-center">Recycling Center Requests</h2>
      <RecyclingCenterRequests />
    </div>
  )}
</main>
    </div>
  );
}
