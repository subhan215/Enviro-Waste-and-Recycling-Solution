'use client';
import { useEffect, useState } from 'react';
// DashboardCard imported for potential future use
// import DashboardCard from "../components/admin_panel/dashboard";
import ComplaintsTable from "../components/admin_panel/Reports";
import RewardConversionRequests from "../components/admin_panel/RewardConversionRequests";
import ResignAgreements from "../components/admin_panel/ResignAgreements";
import AreaApprovalRequests from "../components/admin_panel/AreaApprovalRequests";
import Admin_loader from "../components/ui/Admin_loader";
import RecyclingCenterRequests from "../components/admin_panel/RecyclingCenterRequests";
import SubmitMaterialRequests from "../components/admin_panel/SubmitMaterialRequests";
import { DashboardLayout, SidebarItem, SidebarSection } from "../components/layouts/DashboardLayout";

// SVG Icons
const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  ),
  Complaints: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Rewards: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Resign: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Area: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  ),
  Recycling: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Upload: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  ),
  Building: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Document: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Alert: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  Dollar: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [companiesCount, setCompaniesCount] = useState(0);
  const [agreementsCount, setAgreementsCount] = useState(0);
  const [transactionsCount, setTransactionsCount] = useState(0);
  const [totalEquivalentPkr, setTotalEquivalentPkr] = useState(0);
  const [complaintsCount, setComplaintsCount] = useState(0);
  const [loading, setLoading] = useState(true);

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
      setLoading(true);
      const companies = await fetchCompaniesCount();
      const agreements = await fetchAgreementsCount();
      const { transactionsCount, totalEquivalentPkr } = await fetchApprovedTransactionsWithTotal();
      const complaints = await fetchComplaintsCount();

      setCompaniesCount(companies);
      setAgreementsCount(agreements);
      setTransactionsCount(transactionsCount);
      setTotalEquivalentPkr(totalEquivalentPkr);
      setComplaintsCount(complaints);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <Admin_loader />;
  }

  const sidebar = (
    <>
      <SidebarSection title="Overview">
        <SidebarItem
          icon={<Icons.Dashboard />}
          label="Dashboard"
          active={activeTab === 'dashboard'}
          onClick={() => setActiveTab('dashboard')}
        />
      </SidebarSection>

      <SidebarSection title="Management">
        <SidebarItem
          icon={<Icons.Complaints />}
          label="User Complaints"
          active={activeTab === 'complaints'}
          onClick={() => setActiveTab('complaints')}
          badge={complaintsCount > 0 ? complaintsCount : null}
        />
        <SidebarItem
          icon={<Icons.Rewards />}
          label="Reward Requests"
          active={activeTab === 'reward-requests'}
          onClick={() => setActiveTab('reward-requests')}
        />
        <SidebarItem
          icon={<Icons.Resign />}
          label="Resign Agreements"
          active={activeTab === 'resign-agreements'}
          onClick={() => setActiveTab('resign-agreements')}
        />
      </SidebarSection>

      <SidebarSection title="Services">
        <SidebarItem
          icon={<Icons.Area />}
          label="Area Approval"
          active={activeTab === 'area-approval'}
          onClick={() => setActiveTab('area-approval')}
        />
        <SidebarItem
          icon={<Icons.Recycling />}
          label="Recycling Centers"
          active={activeTab === 'recycling-requests'}
          onClick={() => setActiveTab('recycling-requests')}
        />
        <SidebarItem
          icon={<Icons.Upload />}
          label="Material Submissions"
          active={activeTab === 'submit-materials'}
          onClick={() => setActiveTab('submit-materials')}
        />
      </SidebarSection>
    </>
  );

  return (
    <DashboardLayout sidebar={sidebar} title="Admin Panel">
      {activeTab === "dashboard" && (
        <div className="p-4 md:p-6">
          {/* Dashboard Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard Overview</h1>
            <p className="text-gray-500 mt-1">Monitor key metrics and system activity</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Companies</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{companiesCount}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Icons.Building />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Active Agreements</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{agreementsCount}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Icons.Document />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Complaints (Month)</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{complaintsCount}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Icons.Alert />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Transactions (Month)</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">{transactionsCount}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Icons.Dollar />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Amount (Month)</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">Rs. {totalEquivalentPkr.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Icons.Dollar />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveTab('complaints')}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Icons.Complaints />
                </div>
                <span className="text-sm font-medium text-gray-700">View Complaints</span>
              </button>
              <button
                onClick={() => setActiveTab('reward-requests')}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Icons.Rewards />
                </div>
                <span className="text-sm font-medium text-gray-700">Reward Requests</span>
              </button>
              <button
                onClick={() => setActiveTab('area-approval')}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icons.Area />
                </div>
                <span className="text-sm font-medium text-gray-700">Area Approvals</span>
              </button>
              <button
                onClick={() => setActiveTab('submit-materials')}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Icons.Upload />
                </div>
                <span className="text-sm font-medium text-gray-700">Material Submissions</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "complaints" && <ComplaintsTable />}
      {activeTab === "reward-requests" && <RewardConversionRequests />}
      {activeTab === "resign-agreements" && <ResignAgreements />}
      {activeTab === "area-approval" && <AreaApprovalRequests />}
      {activeTab === "recycling-requests" && <RecyclingCenterRequests />}
      {activeTab === "submit-materials" && <SubmitMaterialRequests />}
    </DashboardLayout>
  );
}
