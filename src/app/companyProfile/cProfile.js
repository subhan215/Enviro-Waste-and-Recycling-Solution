"use client"; // Ensure the component is treated as a client component
import { useState, useEffect } from "react";

const CompanyProfilePage = () => {
  const [profile, setProfile] = useState({
    companyName: "JAABO",
    NoOfEmployees: 30,
    dateOfInvention: { day: "31", month: "September", year: "1990" },
    email: "bradley.ortiz@gmail.com",
    phoneNumber: "03423375429",
    address: "116 Jaskolski Stravane Suite 883",
    country: "Pakistan",
    website: "jaabo.io",
    slogan: "Fit environment makes human fit",
    paymentMethods: [
      { type: "Visa", lastFour: "8314", expires: "06/24" },
      { type: "MasterCard", lastFour: "8314", expires: "07/25" },
    ],
  });

  const [nonServedAreas, setNonServedAreas] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch non-served areas from API
    const fetchNonServedAreas = async () => {
      try {
        const response = await fetch("/api/area/get_all_non_served_areas");
        const data = await response.json();
        setNonServedAreas(data); // Assuming the response contains the areas
      } catch (error) {
        console.error("Error fetching non-served areas:", error);
      }
    };

    fetchNonServedAreas();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleAreaSelect = (area) => {
    setSelectedAreas((prev) =>
      prev.includes(area)
        ? prev.filter((a) => a !== area)
        : [...prev, area]
    );
  };

  const handleSaveSelectedAreas = () => {
    // Save the selected areas logic goes here
    console.log("Selected Areas:", selectedAreas);
    setIsModalOpen(false);
  };

  return (
    <div className="profile-edit-container">
      <h1>Edit Company Profile</h1>
      <div className="profile-section">
        <img src="/default-profile.jpg" alt="Profile" className="profile-pic" />
        <button className="upload-btn">Change Picture</button>
      </div>

      <div className="form-section">
        {/* Existing form fields... */}
        <label>
          Company Name:
          <input
            type="text"
            name="companyName"
            value={profile.companyName}
            onChange={handleInputChange}
          />
        </label>
        {/* Add other fields similarly */}
      </div>

      <div className="payment-methods">
        <h3>Payment Methods</h3>
        {profile.paymentMethods.map((method, index) => (
          <div key={index} className="payment-method">
            <p>
              {method.type} ... {method.lastFour} Expires {method.expires}
            </p>
            <button>Remove</button>
          </div>
        ))}
        <button className="add-payment-btn">Add Payment Method</button>
      </div>

      {/* Button to open the modal */}
      <button className="select-areas-btn" onClick={() => setIsModalOpen(true)}>
        Select Non-Served Areas
      </button>

      {/* Modal for selecting areas */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Select Non-Served Areas</h2>
            <ul>
              {nonServedAreas.map((area, index) => (
                <li key={index}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedAreas.includes(area)}
                      onChange={() => handleAreaSelect(area)}
                    />
                    {area}
                  </label>
                </li>
              ))}
            </ul>
            <button onClick={handleSaveSelectedAreas}>Save Selected Areas</button>
            <button onClick={() => setIsModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyProfilePage;
