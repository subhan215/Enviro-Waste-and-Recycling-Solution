import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Loader from "../ui/Loader";
import NoDataDisplay from "../animations/NoDataDisplay";
import Alert from '../ui/Alert';

function AcceptRequests() {
  const [requests, setRequests] = useState([]);
  const [newPriceOffered, setNewPriceOffered] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null);
  const userData = useSelector((state) => state.userData.value);
  const [alert, setAlert] = useState([]);

  const showAlert = (type, message) => {
    const id = Date.now();
    setAlert([...alert, { id, type, message }]);
    setTimeout(() => {
      setAlert((alerts) => alerts.filter((alert) => alert.id !== id));
    }, 4000);
  };

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `/api/requests/get_requests_near_company/${userData.user_id}`
        );
        const fetchedRequests = response.data.requests;

        const requestsWithLocationNames = await Promise.all(
          fetchedRequests.map(async (request) => {
            const locationName = await fetchLocationName(request.latitude, request.longitude);
            return { ...request, locationName };
          })
        );

        setRequests(requestsWithLocationNames);
      } catch (err) {
        console.error("Error fetching requests:", err);
      } finally {
        setLoading(false);
      }
    };

    setTimeout(fetchRequests, 1000);
  }, [userData.user_id]);

  const fetchLocationName = async (lat, lon) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      return response.data.display_name || "Location not found";
    } catch (err) {
      console.error("Error fetching location name:", err);
      return "Unknown location";
    }
  };

  const handleOfferPrice = async (requestId, oldPrice, newPrice) => {
    if (!newPrice || isNaN(newPrice)) {
      showAlert('warning', 'Please enter a valid price');
      return;
    }
    if (oldPrice && parseFloat(oldPrice) < parseFloat(newPrice)) {
      showAlert('error', 'Your offered price should be less than the current best offer!');
      return;
    }

    setSubmitting(requestId);
    try {
      const response = await axios.put("/api/requests/offer_price", {
        requestId,
        newPrice,
        company_id: userData.user_id,
      });
      if (response.data.success) {
        showAlert('success', 'Price offered successfully!');
        setRequests((prevRequests) =>
          prevRequests.map((req) =>
            req.request_id === requestId ? { ...req, offered_price: newPrice } : req
          )
        );
        setNewPriceOffered(prev => ({ ...prev, [requestId]: '' }));
      }
    } catch {
      showAlert('error', 'Failed to offer price');
    } finally {
      setSubmitting(null);
    }
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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Waste Requests</h1>
        <p className="text-gray-500 mt-1">View and bid on recycled waste pickup requests</p>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Available Requests</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{requests.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Nearby Opportunities</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{requests.filter(r => parseFloat(r.distance) < 10).length}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Pickup Requests</h2>
              <p className="text-sm text-gray-500">Offer competitive prices to win requests</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {requests.length === 0 ? (
            <div className="py-8">
              <NoDataDisplay emptyText="No requests found" />
              <p className="text-center text-gray-500 mt-4">
                If you haven&apos;t located a recycling center, locate one to see requests near you.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {requests.map((request) => (
                <div
                  key={request.request_id}
                  className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-5 hover:shadow-lg transition-all duration-300"
                >
                  {/* Request Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-xl text-gray-800">{request.weight} kg</p>
                        <p className="text-sm text-gray-500">Waste Weight</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
                      {request.distance} km
                    </span>
                  </div>

                  {/* Request Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-600">
                        {`${new Date(request.date).getMonth() + 1}/${new Date(request.date).getDate()}/${new Date(request.date).getFullYear()}`} at {request.time}
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-gray-600 line-clamp-2">{request.locationName}</span>
                    </div>
                  </div>

                  {/* Current Offer */}
                  {request.offered_price && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-yellow-700">Current Best Offer</span>
                        <span className="font-bold text-yellow-800">Rs. {request.offered_price}</span>
                      </div>
                    </div>
                  )}

                  {/* Offer Form */}
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400 font-medium">Rs.</span>
                      </div>
                      <input
                        type="number"
                        placeholder="Enter your offer"
                        value={newPriceOffered[request.request_id] || ''}
                        onChange={(e) => setNewPriceOffered(prev => ({
                          ...prev,
                          [request.request_id]: e.target.value
                        }))}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <button
                      onClick={() => handleOfferPrice(
                        request.request_id,
                        request.offered_price,
                        newPriceOffered[request.request_id]
                      )}
                      disabled={submitting === request.request_id}
                      className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {submitting === request.request_id ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Offer Price
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AcceptRequests;
