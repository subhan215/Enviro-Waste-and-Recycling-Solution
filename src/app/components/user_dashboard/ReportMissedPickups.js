// import React, { useEffect, useState } from "react";

// const ReportMissedPickups = () => {
//     const [allMissedPickups, setAllMissedPickups] = useState([]);
//     const [userId, setUserId] = useState(1); // Assuming user ID is 1
//     const [areaId, setAreaId] = useState(2); // Initial area ID to be used for reporting

//     // Function to report a missed pickup
//     const reportMissedPickup = async () => {
//         try {
//             console.log("Report missed pickup");
//             let response = await fetch(`/api/pickup/report_missed_pickup/`, {
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 method: "POST",
//                 body: JSON.stringify({ userId, areaId }),
//             });

//             const responseData = await response.json();
//             console.log(responseData);
//             if (responseData.success) {
//                 getAllMissedPickups();
//                 alert("Missed pickup reported successfully.");
//             } else {
//                 alert(responseData.message);
//             }
//         } catch (error) {
//             alert(error.message);
//         }
//     };

//     // Function to get all missed pickups
//     const getAllMissedPickups = async () => {
//         try {
//             console.log("Get missed pickups");
//             let response = await fetch(`/api/pickup/get_All_missed_pickups_for_user/${userId}/`, {
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 method: "GET",
//             });

//             const responseData = await response.json();
//             console.log(responseData);
//             if (responseData.success) {
//                 setAllMissedPickups(responseData.data);
//             } else {
//                 alert(responseData.message);
//             }
//         } catch (error) {
//             alert(error.message);
//         }
//     };

//     // Function to update the status of a missed pickup
//     const updateMissedPickupStatus = async (missedPickupId, newStatus = "") => {
//         try {
//             console.log("Updating missed pickup status");
//             const response = await fetch(`/api/pickup/confirmed_from_user/`, {
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 method: "PUT",
//                 body: JSON.stringify({ missed_pickup_id: missedPickupId, userId , newStatus }),
//             });

//             const responseData = await response.json();
//             console.log(responseData);
//             if (responseData.success) {
//                 getAllMissedPickups();
//                 alert("Missed pickup status updated successfully.");
//             } else {
//                 alert(responseData.message);
//             }
//         } catch (error) {
//             alert(error.message);
//         }
//     };

//     useEffect(() => {
//         getAllMissedPickups();
//     }, []);

//     return (
//         <div>
//             <h2>Missed Pickups</h2>
//             {/* List of missed pickups */}
//             <ul>
//                 {allMissedPickups.length > 0 ? (
//                     allMissedPickups.map((pickup, index) => (
//                         <li key={index}>
//                             <strong>Date:</strong> {new Date(pickup.created_at).toLocaleDateString()}
//                             | <strong>Status:</strong> {pickup.status}
//                             {pickup.status === "marked completed by company" && (
//                                 <>
//                                     <button onClick={() => updateMissedPickupStatus(pickup.missed_pickup_id, "completed")}>
//                                         Mark as Completed
//                                     </button>
//                                     <button onClick={() => updateMissedPickupStatus(pickup.missed_pickup_id, "pending")}>
//                                         Mark as Pending
//                                     </button>
//                                 </>
//                             )}
//                             {
//                                 pickup.status === "pending" && (
//                                     <>
//                                         <button onClick={() => updateMissedPickupStatus(pickup.missed_pickup_id, "marked completed by user")}>
//                                             Mark as Completed From Your Side
//                                         </button>
//                                     </>
//                                 )
//                             }
//                         </li>
//                     ))
//                 ) : (
//                     <p>No missed pickups reported yet.</p>
//                 )}
//             </ul>

//             <form onSubmit={(e) => { e.preventDefault(); reportMissedPickup(); }}>
//                 <button type="submit">Report Missed Pickup</button>
//             </form>
//         </div>
//     );
// };

// export default ReportMissedPickups;




import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ReportMissedPickups = () => {
    const [allMissedPickups, setAllMissedPickups] = useState([]);
    const userData = useSelector((state) => state.userData.value)
    //const [userId, setUserId] = useState(userData.user_id); // Assuming user ID is 1
    //const [areaId, setAreaId] = useState(userData.area_id); // Initial area ID to be used for reporting
    const [selectedImage, setSelectedImage] = useState(null); // State to hold the selected image
    console.log(userData)
    let userId = userData.user_id ; 
    let areaId = userData.area_id;
    // Function to handle image selection
    const handleImageChange = (event) => {
        setSelectedImage(event.target.files[0]);
    };

    // Function to report a missed pickup
    const reportMissedPickup = async (event) => {
        event.preventDefault();
        try {
            console.log("Report missed pickup");

            // Use FormData to include the image file in the request
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
            console.log("Response Data : ", responseData);
            if (responseData.success) {     //All conditions, constraints, checks etc passed
                getAllMissedPickups();
                console.log("Message : ", responseData.message);
                alert("Missed pickup reported successfully.");
            } else {
                alert(responseData.message);
            }
        } catch (error) {
            alert(error.message);
        }
    };

    // Function to get all missed pickups
    const getAllMissedPickups = async () => {
        try {
            console.log("Get missed pickups");
            let response = await fetch(`/api/pickup/get_All_missed_pickups_for_user/${userId}/`, {
                headers: {
                    "Content-Type": "application/json",
                },
                method: "GET",
            });

            const responseData = await response.json();
            console.log(responseData);
            if (responseData.success) {
                setAllMissedPickups(responseData.data);
            } else {
                alert(responseData.message);
            }
        } catch (error) {
            alert(error.message);
        }
    };

    // Function to update the status of a missed pickup
    const updateMissedPickupStatus = async (missedPickupId, newStatus = "") => {
        try {
            console.log("Updating missed pickup status");
            const response = await fetch(`/api/pickup/confirmed_from_user/`, {
                headers: {
                    "Content-Type": "application/json",
                },
                method: "PUT",
                body: JSON.stringify({ missed_pickup_id: missedPickupId, userId, newStatus }),
            });

            const responseData = await response.json();
            console.log(responseData);
            if (responseData.success) {
                getAllMissedPickups();
                alert("Missed pickup status updated successfully.");
            } else {
                alert(responseData.message);
            }
        } catch (error) {
            alert(error.message);
        }
    };

    useEffect(() => {
        getAllMissedPickups();
    }, []);

    return (
        <div>
          <h2>Missed Pickups</h2>
          {/* List of missed pickups */}
          <ul>
            {allMissedPickups.length > 0 ? (
              allMissedPickups.map((pickup, index) => (
                <li key={index}>
                  <strong>ID:</strong> {pickup.missed_pickup_id}
                  <strong>Against Company : </strong> {pickup.company_id}
                  <strong> Date:</strong> {new Date(pickup.created_at).toLocaleDateString()}
                  <strong> Status:</strong> {pickup.status}
                  
                  {/* Display Clean Image */}
                  {pickup.clean_img && (
                    <div>
                      <strong>Clean Image:</strong>
                      <img
                        src={pickup.clean_img}
                        alt="Clean Pickup"
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }} // Adjust as necessary
                      />
                    </div>
                  )}
                  
                  {/* Conditional buttons based on status */}
                  {pickup.status === "marked completed by company" && (
                    <>
                      <button onClick={() => updateMissedPickupStatus(pickup.missed_pickup_id, "completed")}>
                        Mark as Completed
                      </button>
                      <button onClick={() => updateMissedPickupStatus(pickup.missed_pickup_id, "pending")}>
                        Mark as Pending
                      </button>
                    </>
                  )}
                  {pickup.status === "pending" && (
                    <button onClick={() => updateMissedPickupStatus(pickup.missed_pickup_id, "marked completed by user")}>
                      Mark as Completed From Your Side
                    </button>
                  )}
                </li>
              ))
            ) : (
              <p>No missed pickups reported yet.</p>
            )}
          </ul>
      
          {/* Form for Reporting Missed Pickup */}
          <form onSubmit={reportMissedPickup}>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            <button type="submit">Report Missed Pickup</button>
          </form>
        </div>
      );
      
};

export default ReportMissedPickups;

