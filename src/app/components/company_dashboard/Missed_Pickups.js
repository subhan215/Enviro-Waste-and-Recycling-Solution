// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const Missed_Pickups = ({ companyId = 10 }) => {
//   const [missedPickups, setMissedPickups] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);



//   useEffect(() => {
//     const fetchMissedPickups = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get(`/api/pickup/get_All_missed_pickups_for_company/${companyId}`);
//         console.log(response);
//         setMissedPickups(response.data.data);
//       } catch (err) {
//         setError('Failed to load missed pickups.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMissedPickups();
//   }, [companyId]);

//   const markAsCompleted = async (missedPickupId) => {
//     const formData = new FormData()
//     formData.append("userId", 10)
//     formData.append("missed_pickup_id" , missedPickupId )
//     formData.append("clean_or_unclean_image", selectedImage);
//     try {
//         const response = await axios.put(
//             `/api/pickup/completed_by_company/`,
//             {
//               userId: 10,
//               missed_pickup_id: missedPickupId,
//             },
//             {
//               headers: {
//                 'Content-Type': 'application/json',
//               },
//             }
//           );
//       console.log(response);
//       // Update the status of the missed pickup locally after a successful update
//       setMissedPickups((prevPickups) =>
//         prevPickups.map((pickup) =>
//           pickup.missed_pickup_id === missedPickupId ? { ...pickup, status: 'Completed by company' } : pickup
//         )
//       );
//     } catch (error) {
//       console.error('Failed to update the status of the missed pickup.');
//     }
//   };

//   if (loading) return <p>Loading missed pickups...</p>;
//   if (error) return <p>{error}</p>;

//   return (
//     <div>
//       <h2>Missed Pickups</h2>
//       {missedPickups.length === 0 ? (
//         <p>No missed pickups found for this company.</p>
//       ) : (
//         <table>
//           <thead>
//             <tr>
//               <th>Missed Pickup ID</th>
//               <th>User ID</th>
//               <th>Area ID</th>
//               <th>Status</th>
//               <th>Date</th>
//               <th>Time</th>
//               <th>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {missedPickups.map((pickup) => {
//               const date = new Date(pickup.created_at);
//               const formattedDate = date.toLocaleDateString();
//               const formattedTime = date.toLocaleTimeString();

//               return (
//                 <tr key={pickup.missed_pickup_id}>
//                   <td>{pickup.missed_pickup_id}</td>
//                   <td>{pickup.user_id}</td>
//                   <td>{pickup.area_id}</td>
//                   <td>
//                     {pickup.status === 'marked completed by company' ? 'Waiting for user response' : pickup.status}
//                   </td>
//                   <td>{formattedDate}</td>
//                   <td>{formattedTime}</td>
//                   <td>
//                     {(pickup.status === 'pending' || pickup.status === 'marked completed by user') && (
//                       <button onClick={() => markAsCompleted(pickup.missed_pickup_id)}>
//                         Mark as Completed
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default Missed_Pickups;


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
const Missed_Pickups = ({}) => {
  const [missedPickups, setMissedPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null); // State for the selected image
  const [selectedPickupId, setSelectedPickupId] = useState(null); // State for the selected pickup ID
  const userData = useSelector((state) => state.userData.value)
  let companyId = userData.user_id
  useEffect(() => {
    const fetchMissedPickups = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/pickup/get_All_missed_pickups_for_company/${companyId}`);
        console.log(response);
        setMissedPickups(response.data.data);
      } catch (err) {
        setError('Failed to load missed pickups.');
      } finally {
        setLoading(false);
      }
    };

    fetchMissedPickups();
  }, [companyId]);

  const handleImageChange = (e, missedPickupId) => {
    const file = e.target.files[0];
    setSelectedImage(file);
    setSelectedPickupId(missedPickupId); // Set the selected pickup ID
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
      const response = await axios.put(
        `/api/pickup/completed_by_company/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log("Response by Axios : ", response);
      if(response.data.success){
      // Update the status of the missed pickup locally after a successful update
      setMissedPickups((prevPickups) =>
        prevPickups.map((pickup) =>
          pickup.missed_pickup_id === missedPickupId ? { ...pickup, status: 'Completed by company' } : pickup
        )
      );
      alert('Missed pickup marked as completed.');
    }
    else{
      alert('Cant mark pickup completed cuz u uploaded unclean image!!- Ja sahi say safai kar');
    }
    } catch (error) {
      console.error('Error : ', error);
      alert('Failed to update the status of the missed pickup.');
    }
  };

  if (loading) return <p>Loading missed pickups...</p>;
  if (error) return <p>{error}</p>;
  return (
    <div>
      <h2>Missed Pickups</h2>
      {missedPickups.length === 0 ? (
        <p>No missed pickups found for this company.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Missed Pickup ID</th>
              <th>User ID</th>
              <th>Area ID</th>
              <th>Status</th>
              <th>Date</th>
              <th>Time</th>
              <th>Action</th>
              <th>Unclean Image</th> {/* Add column for the image */}
            </tr>
          </thead>
          <tbody>
            {missedPickups.map((pickup) => {
              const date = new Date(pickup.created_at);
              const formattedDate = date.toLocaleDateString();
              const formattedTime = date.toLocaleTimeString();
  
              return (
                <tr key={pickup.missed_pickup_id}>
                  <td>{pickup.missed_pickup_id}</td>
                  <td>{pickup.user_id}</td>
                  <td>{pickup.area_id}</td>
                  <td>
                    {pickup.status === 'marked completed by company' ? 'Waiting for user response' : pickup.status}
                  </td>
                  <td>{formattedDate}</td>
                  <td>{formattedTime}</td>
                  <td>
                    {(pickup.status === 'pending' || pickup.status === 'marked completed by user') && (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, pickup.missed_pickup_id)}
                        />
                        <button onClick={() => markAsCompleted(pickup.missed_pickup_id)}>
                          Mark as Completed
                        </button>
                      </>
                    )}
                  </td>
                  <td>
                    {/* Display the image if the URL exists */}
                    {pickup.unclean_img && (
                      <img
                        src={pickup.unclean_img}
                        alt="Unclean Pickup"
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }} // Adjust the style as needed
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
  
};

export default Missed_Pickups;

