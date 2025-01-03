import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
//import Loader from "../ui/Loader";
import Truck_loader from "../ui/Truck_loader";
import NoDataHappyFace from "../animations/noDataHappyFace";
import Alert from '../ui/Alert'



const ReportMissedPickups = () => {
  const [allMissedPickups, setAllMissedPickups] = useState([]);
  const userData = useSelector((state) => state.userData.value);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState([]);
  const showAlert = (type, message) => {
    const id = Date.now();
    setAlert([...alert, { id, type, message }]);
    setTimeout(() => {
      setAlert((alerts) => alerts.filter((alert) => alert.id !== id));
    }, 4000);
  };



  let userId = userData?.user_id;
  let areaId = userData?.area_id;

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);
    // Create a URL for the selected image to display as a preview
    if (file) {
      setSelectedImagePreview(URL.createObjectURL(file));
    }
  };

  const reportMissedPickup = async (event) => {
    event.preventDefault();

    if (allMissedPickups.length > 0) {
      const lastMissedPickup = allMissedPickups[0];
      const lastReportedTime = new Date(lastMissedPickup.created_at).getTime();
      const currentTime = new Date().getTime();
      const timeDifference = currentTime - lastReportedTime;

      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (timeDifference < twentyFourHours) {
        // alert(
        //   "You cannot report another missed pickup within 24 hours of the previous report."
        // );
        showAlert("error" , "You cannot report another missed pickup within 24 hours of the previous report")
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("areaId", areaId);
      if (selectedImage) {
        formData.append("clean_or_unclean_image", selectedImage);
      }

      let response = await fetch(`/api/pickup/report_missed_pickup/`, {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();
      if (responseData.success) {
        getAllMissedPickups();
        //alert("Missed pickup reported successfully.");
        showAlert("success" , "Missed pickup reported successfully")
        setSelectedImagePreview(null)
        setSelectedImage(null)
      } else {
        //alert(responseData.message);
        showAlert("error" , responseData.message)
        
      }
    } catch (error) {
      //alert(error.message);
      showAlert("error" , error.message)
    }
  };

  const getAllMissedPickups = async () => {
    try {
      let response = await fetch(
        `/api/pickup/get_All_missed_pickups_for_user/${userId}/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const responseData = await response.json();
      if (responseData.success) {
        setAllMissedPickups(responseData.data);
      }
    } catch (error) {
      //console.log(error.message);
      showAlert("error" , error.message)
    }
  };

  const updateMissedPickupStatus = async (missedPickupId, newStatus = "") => {
    try {
      const response = await fetch(`/api/pickup/confirmed_from_user/`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "PUT",
        body: JSON.stringify({
          missed_pickup_id: missedPickupId,
          userId,
          newStatus,
        }),
      });

      const responseData = await response.json();
      if (responseData.success) {
        getAllMissedPickups();
       // alert("Missed pickup status updated successfully.");
        showAlert("success" , "Missed pickup status updated successfully")
      } else {
        //alert(responseData.message);
        showAlert("error" , responseData.message);
      }
    } catch (error) {
      //alert(error.message);
      showAlert("error" , error.message);
      
    }
  };

  useEffect(() => {
    const fetchMissedPickups = async () => {
      setLoading(true);
      try {
        await getAllMissedPickups();
      } catch (error) {
        console.error('Error fetching missed pickups:', error);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000); // Delay for 5 seconds
      }
    };

    fetchMissedPickups();
  }, [userId]);

  if (loading) return <Truck_loader></Truck_loader>;

return (
<div className="w-full p-6 rounded-lg mx-auto sm:mx-0">
  <h2 className="text-2xl sm:text-3xl font-bold text-custom-black p-2 mb-6 rounded text-center">
    Report Missed Pickups
  </h2>

  {alert.map((alert) => (
    <Alert
      key={alert.id}
      type={alert.type}
      message={alert.message}
      onClose={() => setAlert((alerts) => alerts.filter((a) => a.id !== alert.id))}
    />
  ))}

  {/* Grid layout for missed pickups */}
  {allMissedPickups.length > 0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {allMissedPickups.map((pickup) => (
        <div
          key={pickup.missed_pickup_id}
          className="border-l-4 border-custom-black border-t-2 border-r border-b-2 bg-gray-100 rounded-lg shadow-lg p-4"
        >
          <div className="mb-4">
            <div className="mb-2">
              <strong className="text-gray-700 block">Against Company:</strong>
              <span className="text-gray-900">{pickup.name}</span>
            </div>
            <div className="mb-1">
              <strong className="text-gray-700 block">Date:</strong>
              <span className="text-gray-900">
                {new Date(pickup.created_at).toLocaleDateString()}
              </span>
            </div>
            <div>
              <strong className="text-gray-700 block">Status:</strong>
              <span className="text-gray-900">{pickup.status}</span>
            </div>
          </div>

          {pickup.clean_img && (
            <div className="mt-1">
              <strong className="block text-gray-700">Clean Image:</strong>
              <img
                src={pickup.clean_img}
                alt="Clean Pickup"
                className="w-full h-auto max-h-48 object-cover border border-gray-300 shadow-sm rounded-lg"
              />
            </div>
          )}

          <div className="mt-4 space-y-2">
            {pickup.status === "marked completed by company" && (
              <>
                <button
                  onClick={() =>
                    updateMissedPickupStatus(pickup.missed_pickup_id, "completed")
                  }
                  className="w-full bg-custom-green text-black border border-custom-black py-2 px-4 rounded-lg hover:bg-green-600 transition"
                >
                  Mark as Completed
                </button>
                <button
                  onClick={() =>
                    updateMissedPickupStatus(pickup.missed_pickup_id, "pending")
                  }
                  className="w-full bg-custom-green text-black border border-custom-black py-2 px-4 rounded-lg hover:bg-green-600 transition"
                >
                  Mark as Pending
                </button>
              </>
            )}
            {pickup.status === "pending" && (
              <button
                onClick={() =>
                  updateMissedPickupStatus(pickup.missed_pickup_id, "marked completed by user")
                }
                className="w-full bg-[#00ED64] text-white py-2 px-4 rounded-lg hover:bg-green-600 transition"
              >
                Mark as Completed From Your Side
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="flex justify-center items-center h-40">
      <NoDataHappyFace emptyText="No missed pickups reported yet!" />
    </div>
  )}

  {/* Form for Reporting Missed Pickup */}
  <form onSubmit={reportMissedPickup} className="mt-6 w-full">
    <div className="mb-4 w-full">
      <label
        htmlFor="file-input"
        className="w-full flex items-center justify-center bg-gradient-to-r from-[#00ED64] to-[#00D257] text-black py-2 px-4 cursor-pointer hover:scale-105 transform transition-all shadow-md border border-black rounded-lg"
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
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        <input
          id="file-input"
          type="file"
          accept="image/*"
          onChange={(e) => handleImageChange(e)}
          className="hidden"
        />
      </label>
    </div>

    {selectedImagePreview && (
      <div className="mt-4 flex justify-center mb-4">
        <div className="w-40 h-40">
          <img
            src={selectedImagePreview}
            alt="Selected Preview"
            className="w-full h-full object-cover rounded-lg border-2 border-gray-300 shadow-lg"
          />
        </div>
      </div>
    )}

    <button
      type="submit"
      className="w-full bg-[#00ED64] text-black py-3 px-4 rounded-lg hover:bg-green-600 transition"
    >
      Report Missed Pickup
    </button>
  </form>
</div>


);

};

export default ReportMissedPickups;
