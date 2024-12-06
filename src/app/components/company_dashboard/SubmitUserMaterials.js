import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Alert from '../ui/Alert'


const SubmitUserMaterials = () => {
  const [wastePrices, setWastePrices] = useState([]);
  const [weights, setWeights] = useState({});
  const [userId, setUserId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);  // New state for loading
  const [submitStatus, setSubmitStatus] = useState(""); // For success or error message
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
      //alert("Error while fetching waste prices: ", error);
      showAlert('error' , 'Error while fetching waste prices')
      console.log(error);
    }
  };

  useEffect(() => {
    fetchWastePrices();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Start loading

    const weightsData = wastePrices.map((item) => ({
      name: item.name,
      rate_per_kg: item.rate_per_kg,
      weight: weights[item.name] || 0,
    }));

    // Prepare the data to send to the backend
    const userMaterials = {
      userId,
      weightsData,
    };

    try {
      const response = await axios.post("/api/company/submit-materials", userMaterials);
      if (response.status === 200) {
        setSubmitStatus("Data submitted successfully!");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      setSubmitStatus("There was an error submitting your data.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-8">
      <div className="bg-white shadow-xl rounded-lg p-8">
        <h3 className="text-2xl font-semibold text-custom-black mb-6">Enter Received Weights</h3>

        {alert.map((alert) => (
        <Alert
          key={alert.id}
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert((alert) => alert.filter((a) => a.id !== alert.id))}
        />
      ))}  


        {submitStatus && (
          <div className={`mb-4 p-3 rounded-lg text-center ${submitStatus.includes("success") ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
            {submitStatus}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* User ID Input */}
          <div>
            <label className="block text-lg font-medium text-custom-black mb-2">User ID</label>
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
              <label className="block text-lg font-medium text-custom-black mb-2">
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

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-3 text-lg font-semibold rounded-lg text-custom-black border border-custom-black ${isSubmitting ? 'bg-gray-400' : 'bg-custom-green hover:bg-green-700'}`}
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
