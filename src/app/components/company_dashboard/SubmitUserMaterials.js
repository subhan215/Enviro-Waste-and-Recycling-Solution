import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Alert from '../ui/Alert'


const SubmitUserMaterials = () => {
  const [wastePrices, setWastePrices] = useState([]);
  const [weights, setWeights] = useState({});
  const [userId, setUserId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");
  const [image, setImage] = useState(null); // For image upload
  const [currentRequests, setCurrentRequests] = useState([]); // For displaying current requests
  //const [isSubmitting, setIsSubmitting] = useState(false);  // New state for loading
  //const [submitStatus, setSubmitStatus] = useState(""); // For success or error message
  const [alert, setAlert] = useState([]);
  const showAlert = (type, message) => {
    const id = Date.now();
    setAlert([...alert, { id, type, message }]);
    setTimeout(() => {
      setAlert((alerts) => alerts.filter((alert) => alert.id !== id));
    }, 4000);
  };



  const userData = useSelector((state) => state.userData.value);
  const companyId = userData.user_id;

  // Fetch waste prices from the backend
  const fetchWastePrices = async () => {
    try {
      const response = await axios.get("/api/requests/get_waste_price");
      setWastePrices(response.data.data);
    } catch (error) {
      showAlert('error' , 'Error while fetching waste prices!')
      console.error(error);
    }
  };

  // Fetch current requests from the backend
  const fetchCurrentRequests = async () => {
    try {
      const response = await axios.get(`/api/company/submit-materials/${companyId}`);
      setCurrentRequests(response.data.data);
    } catch (error) {
      console.error("Error fetching current requests:", error);
      //alert("Error while fetching waste prices: ", error);
      showAlert('error' , 'Error fetching current requests!')
      console.log(error);
    }
  };

  useEffect(() => {
    fetchWastePrices();
    fetchCurrentRequests();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const weightsData = wastePrices.map((item) => ({
      name: item.name,
      rate_per_kg: item.rate_per_kg,
      weight: weights[item.name] || 0,
    }));

    // Prepare form data
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("companyId", companyId);
    formData.append("weightsData", JSON.stringify(weightsData));
    if (image) formData.append("image", image);

    try {
      const response = await axios.post(`/api/company/submit-materials/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log(response)
      //alert("asasa")
      if (response.status === 200) {
        setSubmitStatus("Data submitted successfully!");
        setWeights({});
        setImage(null);
        await fetchCurrentRequests(); // Refresh current requests
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      setSubmitStatus("There was an error submitting your data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-8">
  <div className=" shadow-xl rounded-lg p-8">
    <h3 className="text-xl sm:text-xl md:text-2xl font-semibold text-custom-black mb-6">
      Enter Received Weights
    </h3>

    {alert.map((alert) => (
      <Alert
        key={alert.id}
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert((alert) => alert.filter((a) => a.id !== alert.id))}
      />
    ))}

    {submitStatus && (
      <div
        className={`mb-4 p-3 rounded-lg text-center ${
          submitStatus.includes("success")
            ? "bg-green-200 text-green-800"
            : "bg-red-200 text-red-800"
        }`}
      >
        {submitStatus}
      </div>
    )}

    {currentRequests.length > 0 && (
      <div className="mb-6">
        <h4 className="text-base sm:text-base md:text-lg font-semibold text-custom-green mb-4">
          Current Requests
        </h4>
        <ul className="space-y-4">
          {currentRequests.map((request) => (
            <li
              key={request.request_submit_material_id}
              className="border border-custom-green p-4 rounded-lg"
            >
              <p className="text-sm sm:text-sm md:text-base">
                <strong>User ID:</strong> {request.user_id}
              </p>
              <p className="text-sm sm:text-sm md:text-base">
                <strong>Status:</strong> {request.status}
              </p>
              <p className="text-sm sm:text-sm md:text-base">
                <strong>Paper and Cardboard:</strong> {request.paper_cardboard_total} kg
              </p>
              <p className="text-sm sm:text-sm md:text-base">
                <strong>Plastics:</strong> {request.plastics_total} kg
              </p>
              <p className="text-sm sm:text-sm md:text-base">
                <strong>Metals:</strong> {request.metals_total} kg
              </p>
            </li>
          ))}
        </ul>
      </div>
    )}

    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* User ID Input */}
      <div>
        <label className="block text-base sm:text-base md:text-lg font-medium text-custom-black mb-2">
          User ID
        </label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter your user ID"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-green"
          required
        />
      </div>

      {/* Waste Prices and Weights */}
      {wastePrices.map((item) => (
        <div key={item.name}>
          <label className="block text-base sm:text-base md:text-lg font-medium text-custom-black mb-2">
            {item.name} ({item.rate_per_kg} per kg)
          </label>
          <input
            type="number"
            value={weights[item.name] || ""}
            onChange={(e) =>
              setWeights({ ...weights, [item.name]: e.target.value })
            }
            placeholder={`Enter weight for ${item.name}`}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-green"
            required
          />
        </div>
      ))}

      {/* Image Upload */}
      <div>
        <label className="block text-base sm:text-base md:text-lg font-medium text-custom-black mb-2">
          Upload Proof Image
        </label>
        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-green"
          accept="image/*"
          required
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className={`w-full py-3 text-base sm:text-base md:text-lg font-semibold rounded-lg text-custom-black border border-custom-black ${isSubmitting ? 'bg-gray-400' : 'bg-custom-green hover:bg-green-700'}`}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  </div>
</div>
  );
};

export default SubmitUserMaterials;
