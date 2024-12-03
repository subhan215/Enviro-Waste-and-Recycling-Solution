import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Loader from "../ui/Loader";


const Missed_Pickups = () => {
  const [missedPickups, setMissedPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState(null); // New state for image preview
  const [selectedPickupId, setSelectedPickupId] = useState(null);
  const userData = useSelector((state) => state.userData.value);
  const companyId = userData.user_id;

  useEffect(() => {
    const fetchMissedPickups = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/pickup/get_All_missed_pickups_for_company/${companyId}`);
        setMissedPickups(response.data.data);
      } catch (err) {
        setError('Failed to load missed pickups.');
      } finally {
        setTimeout(async () => {
          setLoading(false);  // Set loading to false after fetching is complete
        }, 1000); // 1-second delay
      }
    };

    fetchMissedPickups();
  }, [companyId]);

  const handleImageChange = (e, missedPickupId) => {
    const file = e.target.files[0];
    setSelectedImage(file);
    setSelectedPickupId(missedPickupId);

    // Generate and set image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImagePreview(reader.result); // Set the image preview
    };
    if (file) {
      reader.readAsDataURL(file); // Read the file as a data URL
    }
  };

  const markAsCompleted = async (missedPickupId) => {
    if (!selectedImage || selectedPickupId !== missedPickupId) {
      alert('Please select an image for the missed pickup.');
      return;
    }

    const formData = new FormData();
    formData.append('userId', companyId);
    formData.append('missed_pickup_id', missedPickupId);
    formData.append('clean_or_unclean_image', selectedImage);

    try {
      const response = await axios.put(`/api/pickup/completed_by_company/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setMissedPickups((prevPickups) =>
          prevPickups.map((pickup) =>
            pickup.missed_pickup_id === missedPickupId ? { ...pickup, status: 'Completed by company' } : pickup
          )
        );
        alert('Missed pickup marked as completed.');
      } else {
        alert('Upload failed. Please try again.');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to update the status of the missed pickup.');
    }
  };

  if (loading) return<><Loader></Loader></>;
  if (error) return <p className="text-center text-lg text-red-600">{error}</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold text-[#00ED64] mb-4">Missed Pickups</h2>
      {missedPickups.length === 0 ? (
        <p className="text-gray-600 text-center">No missed pickups found for this company.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {missedPickups.map((pickup) => {
            const date = new Date(pickup.created_at);
            const formattedDate = date.toLocaleDateString();
            const formattedTime = date.toLocaleTimeString();

            return (
              <div
                key={pickup.missed_pickup_id}
                className="bg-white border-l-4 border-[#00ED64] p-4 rounded-lg shadow-md transition-all hover:shadow-lg"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Area: {pickup.name}
                  </h3>
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full ${
                      pickup.status === 'pending'
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {pickup.status === 'marked completed by company'
                      ? 'Awaiting user response'
                      : pickup.status}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-1">
                  <strong>Date:</strong> {formattedDate}
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Time:</strong> {formattedTime}
                </p>

                {(pickup.status === 'pending' || pickup.status === 'marked completed by user') && (
                  <div className="mt-4">
                    <label
                      htmlFor={`file-input-${pickup.missed_pickup_id}`}
                      className="flex items-center justify-center bg-gradient-to-r from-[#00ED64] to-[#00D257] text-white py-2 px-4 rounded-lg cursor-pointer hover:scale-105 transform transition-all shadow-md"
                    >
                      <span className="mr-2">Choose File</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <input
                        id={`file-input-${pickup.missed_pickup_id}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, pickup.missed_pickup_id)}
                        className="hidden"
                      />
                    </label>

                    {/* Display the selected image preview */}
                    {selectedImagePreview && (
                      <div className="mt-4 flex justify-center">
                        <img
                          src={selectedImagePreview}
                          alt="Selected Preview"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-300 shadow-sm"
                        />
                      </div>
                    )}

                    <button
                      onClick={() => markAsCompleted(pickup.missed_pickup_id)}
                      className="bg-[#00ED64] hover:bg-[#00D257] text-white py-2 px-4 rounded-lg font-semibold mt-3 w-full transform transition-all hover:scale-105"
                    >
                      Mark as Completed
                    </button>
                  </div>
                )}

                {pickup.unclean_img && (
                  <div className="mt-3 flex justify-center">
                    <img
                      src={pickup.unclean_img}
                      alt="Unclean Pickup"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300 shadow-sm"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Missed_Pickups;
