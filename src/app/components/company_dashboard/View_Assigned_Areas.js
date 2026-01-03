import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Loader from '../ui/Loader';
import NoDataDisplay from "../../components/animations/NoDataDisplay";
import Alert from '../ui/Alert';

const ManageAndViewAreas = () => {
  const [areas, setAreas] = useState([]);
  const [nonAssignedAreas, setNonAssignedAreas] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [activeTab, setActiveTab] = useState('assigned');
  const userData = useSelector((state) => state.userData.value);
  const [areaRequests, setAreaRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState([]);
  const [companyServices, setCompanyServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  let companyId = userData.user_id;

  const serviceLabels = {
    waste_collection: { label: 'Waste Collection', color: 'emerald', icon: '🗑️' },
    manhole_management: { label: 'Manhole Management', color: 'orange', icon: '🕳️' },
    recycling: { label: 'Recycling', color: 'blue', icon: '♻️' }
  };

  const showAlert = (type, message) => {
    const id = Date.now();
    setAlert([...alert, { id, type, message }]);
    setTimeout(() => {
      setAlert((alerts) => alerts.filter((alert) => alert.id !== id));
    }, 4000);
  };

  const fetchAreas = async () => {
    try {
      const response = await fetch(`/api/area/get_all_assigned_areas/${companyId}`);
      const data = await response.json();
      if (data.success) {
        setAreas(data.data);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  };

  const fetchNonAssignedAreas = async (serviceType) => {
    if (!serviceType) return;
    try {
      const response = await fetch(`/api/area/get_available_areas_for_service/${serviceType}`);
      const data = await response.json();
      if (data.success) {
        setNonAssignedAreas(data.data);
      } else {
        const fallbackResponse = await fetch("/api/area/get_all_non_served_areas");
        const fallbackData = await fallbackResponse.json();
        setNonAssignedAreas(fallbackData.data);
      }
    } catch (error) {
      console.error("Error fetching available areas:", error);
    }
  };

  const fetchAreaRequests = async () => {
    try {
      const response = await fetch(`/api/area/get_area_for_request_approval/${companyId}`);
      const data = await response.json();
      if (data.success) {
        setAreaRequests(data.data);
      }
    } catch (err) {
      console.error("Error fetching area requests:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      // Fetch company services first and get the first service
      const servicesResponse = await fetch(`/api/company/get_services/${companyId}`);
      const servicesData = await servicesResponse.json();
      let firstService = '';
      if (servicesData.success && servicesData.data.length > 0) {
        setCompanyServices(servicesData.data);
        firstService = servicesData.data[0];
        setSelectedServiceType(firstService);
      }

      // Fetch areas for the first service type
      if (firstService) {
        await fetchNonAssignedAreas(firstService);
      }

      await fetchAreas();
      await fetchAreaRequests();
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && selectedServiceType) {
      fetchNonAssignedAreas(selectedServiceType);
      setSelectedAreas([]);
    }
  }, [selectedServiceType]);

  const handleAreaSelect = (areaId) => {
    setSelectedAreas((prevSelectedAreas) =>
      prevSelectedAreas.includes(areaId)
        ? prevSelectedAreas.filter((id) => id !== areaId)
        : [...prevSelectedAreas, areaId]
    );
  };

  const handleSelectAll = () => {
    const filteredAreas = nonAssignedAreas.filter(area =>
      area.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (selectedAreas.length === filteredAreas.length) {
      setSelectedAreas([]);
    } else {
      setSelectedAreas(filteredAreas.map(area => area.area_id));
    }
  };

  const handleAssignArea = async () => {
    if (selectedAreas.length > 0) {
      try {
        const response = await fetch(`/api/area/assign_areas_to_company`, {
          headers: { "Content-Type": "application/json" },
          method: "POST",
          body: JSON.stringify({ selectedAreas, company_id: companyId, service_type: selectedServiceType }),
        });

        const responseData = await response.json();
        if (responseData.success) {
          showAlert("success", `Area request sent for ${serviceLabels[selectedServiceType]?.label}!`);
          fetchAreas();
          fetchAreaRequests();
          setSelectedAreas([]);
          setActiveTab('requests');
          fetchNonAssignedAreas(selectedServiceType);
        } else {
          showAlert("error", responseData.message);
        }
      } catch (error) {
        showAlert("error", error.message);
      }
    }
  };

  const filteredNonAssignedAreas = nonAssignedAreas.filter(area =>
    area.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    return statusStyles[status] || statusStyles.pending;
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {alert.map((a) => (
        <Alert
          key={a.id}
          type={a.type}
          message={a.message}
          onClose={() => setAlert((alerts) => alerts.filter((al) => al.id !== a.id))}
        />
      ))}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Area Management</h1>
        <p className="text-gray-500 mt-1">Manage your service areas and requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Assigned Areas</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{areas.length}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{areaRequests.filter(r => r.status === 'pending').length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Available Areas</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{nonAssignedAreas.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('assigned')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
              activeTab === 'assigned'
                ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Assigned Areas
            </span>
          </button>
          <button
            onClick={() => setActiveTab('request')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
              activeTab === 'request'
                ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Request New Areas
            </span>
          </button>
          <button
            onClick={() => { setActiveTab('requests'); fetchAreaRequests(); }}
            className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
              activeTab === 'requests'
                ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              My Requests
              {areaRequests.filter(r => r.status === 'pending').length > 0 && (
                <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full">
                  {areaRequests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Assigned Areas Tab */}
          {activeTab === 'assigned' && (
            <div>
              {areas.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {areas.map((area, index) => {
                    const serviceInfo = serviceLabels[area.service_type] || serviceLabels.waste_collection;
                    return (
                      <div
                        key={index}
                        className="group bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-5 hover:shadow-lg hover:border-emerald-200 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                            Active
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{area.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm">{serviceInfo.icon}</span>
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: area.service_type === 'waste_collection' ? '#ecfdf5' : area.service_type === 'manhole_management' ? '#fff7ed' : '#eff6ff',
                              color: area.service_type === 'waste_collection' ? '#047857' : area.service_type === 'manhole_management' ? '#c2410c' : '#1d4ed8'
                            }}
                          >
                            {serviceInfo.label}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                          {area.licenseplate ? (
                            <span className="font-medium text-gray-700">{area.licenseplate}</span>
                          ) : (
                            <span className="text-gray-400 italic">No truck assigned</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12">
                  <NoDataDisplay emptyText="No areas assigned yet" />
                  <p className="text-center text-gray-500 mt-4">
                    Go to "Request New Areas" tab to request areas for your services
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Request New Areas Tab */}
          {activeTab === 'request' && (
            <div>
              {/* Service Type Selection */}
              {companyServices.length > 0 ? (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Service Type
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {companyServices.map((service) => {
                        const serviceInfo = serviceLabels[service];
                        const isSelected = selectedServiceType === service;
                        return (
                          <button
                            key={service}
                            onClick={() => setSelectedServiceType(service)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all ${
                              isSelected
                                ? `border-${serviceInfo.color}-500 bg-${serviceInfo.color}-50 text-${serviceInfo.color}-700 shadow-sm`
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                            }`}
                            style={isSelected ? {
                              borderColor: service === 'waste_collection' ? '#10b981' : service === 'manhole_management' ? '#f97316' : '#3b82f6',
                              backgroundColor: service === 'waste_collection' ? '#ecfdf5' : service === 'manhole_management' ? '#fff7ed' : '#eff6ff',
                              color: service === 'waste_collection' ? '#047857' : service === 'manhole_management' ? '#c2410c' : '#1d4ed8'
                            } : {}}
                          >
                            <span className="text-lg">{serviceInfo.icon}</span>
                            <span className="font-medium">{serviceInfo.label}</span>
                            {isSelected && (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Search and Select All */}
                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative flex-1">
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search areas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    {filteredNonAssignedAreas.length > 0 && (
                      <button
                        onClick={handleSelectAll}
                        className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap"
                      >
                        {selectedAreas.length === filteredNonAssignedAreas.length ? 'Deselect All' : 'Select All'}
                      </button>
                    )}
                  </div>

                  {/* Areas Grid */}
                  {filteredNonAssignedAreas.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-2">
                        {filteredNonAssignedAreas.map((area) => {
                          const isSelected = selectedAreas.includes(area.area_id);
                          return (
                            <div
                              key={area.area_id}
                              onClick={() => handleAreaSelect(area.area_id)}
                              className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                                isSelected
                                  ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                                  : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                                  isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                                }`}>
                                  {isSelected && (
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                                <span className={`font-medium ${isSelected ? 'text-emerald-700' : 'text-gray-700'}`}>
                                  {area.name}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Selection Summary and Submit */}
                      {selectedAreas.length > 0 && (
                        <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                              <p className="text-emerald-800 font-medium">
                                {selectedAreas.length} area{selectedAreas.length > 1 ? 's' : ''} selected
                              </p>
                              <p className="text-emerald-600 text-sm">
                                Service: {serviceLabels[selectedServiceType]?.label}
                              </p>
                            </div>
                            <div className="flex gap-3 w-full sm:w-auto">
                              <button
                                onClick={() => setSelectedAreas([])}
                                className="flex-1 sm:flex-none px-4 py-2.5 border border-gray-300 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleAssignArea}
                                className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                              >
                                Send Request
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="py-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                      </div>
                      <p className="text-gray-500">No available areas for {serviceLabels[selectedServiceType]?.label}</p>
                      <p className="text-gray-400 text-sm mt-1">All areas are already assigned for this service</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium">No services registered</p>
                  <p className="text-gray-400 text-sm mt-1">Your company hasn't registered for any services yet</p>
                </div>
              )}
            </div>
          )}

          {/* My Requests Tab */}
          {activeTab === 'requests' && (
            <div>
              {areaRequests.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {areaRequests.map((req, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadge(req.status)}`}>
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">{req.name}</h3>
                      {req.service_type && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm">{serviceLabels[req.service_type]?.icon}</span>
                          <span className="text-sm text-gray-500">{serviceLabels[req.service_type]?.label}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12">
                  <NoDataDisplay emptyText="No requests yet" />
                  <p className="text-center text-gray-500 mt-4">
                    Your area requests will appear here
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageAndViewAreas;
