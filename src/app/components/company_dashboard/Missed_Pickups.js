import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Missed_Pickups = ({ companyId = 1 }) => {
  const [missedPickups, setMissedPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const markAsCompleted = async (missedPickupId) => {
    try {
        const response = await axios.put(
            `/api/pickup/completed_by_company/`,
            {
              userId: 1,
              missed_pickup_id: missedPickupId,
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
      console.log(response);
      // Update the status of the missed pickup locally after a successful update
      setMissedPickups((prevPickups) =>
        prevPickups.map((pickup) =>
          pickup.missed_pickup_id === missedPickupId ? { ...pickup, status: 'Completed by company' } : pickup
        )
      );
    } catch (error) {
      console.error('Failed to update the status of the missed pickup.');
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
                      <button onClick={() => markAsCompleted(pickup.missed_pickup_id)}>
                        Mark as Completed
                      </button>
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
