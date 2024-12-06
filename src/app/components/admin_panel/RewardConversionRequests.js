import { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import NoDataDisplay from "../animations/NoDataDisplay";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import Admin_loader from "../ui/Admin_loader"


const RewardConversionRequests = () => {
  const [rewardConversions, setRewardConversions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRewardConversions() {
      try {
        const response = await fetch(
          "/api/admin/get_reward_conversion_requests"
        );
        const data = await response.json();
        setRewardConversions(data.data);
      } catch (error) {
        console.error("Error fetching reward conversions:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRewardConversions();
  }, []);

  const handleAction = async (conversionId, status) => {
    try {
      const response = await fetch("/api/admin/reward_conversion_action", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversionId, status }),
      });

      const result = await response.json();

      if (result.success) {
        setRewardConversions((prev) =>
          prev.map((conversion) =>
            conversion.conversion_id === conversionId
              ? { ...conversion, status }
              : conversion
          )
        );
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error("Error updating reward conversion status:", error);
    }
  };

  if (isLoading) {
    return <Admin_loader></Admin_loader>
  }

  return (
    <div className="flex flex-col items-center justify-center">
      {rewardConversions.length === 0 ? (
         <div className="flex items-center justify-center">
         <NoDataDisplay emptyText="No reward conversion requests" />
       </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
  {rewardConversions.map((conversion) => (
    <div
      key={conversion.conversion_id}
      className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#17cf42] hover:shadow-lg transition duration-300"
    >
      {/* Icons placed at the top right */}
      <div className="flex justify-end space-x-2 mb-4">
        <button
          onClick={() => handleAction(conversion.conversion_id, "Approved")}
          className="text-green-500 hover:text-green-700"
          aria-label="Approve"
        >
          <FontAwesomeIcon icon={faCheck} className="h-6 w-6" />
        </button>
        <button
          onClick={() => handleAction(conversion.conversion_id, "Rejected")}
          className="text-red-500 hover:text-red-700"
          aria-label="Reject"
        >
          <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
        </button>
      </div>

      {/* Content section */}
      <h3 className="text-xl font-semibold text-[#17cf42] mb-2">
        {conversion.name}
      </h3>
      <p className="text-sm text-gray-600 mb-4">{conversion.email_id}</p>
      <div className="text-gray-800 mb-4">
        <p className="font-medium">
          Reward Amount:{" "}
          <span className="text-[#17cf42]">{conversion.conversion_amount}</span>
        </p>
        <p className="font-medium">
          Equivalent PKR:{" "}
          <span className="text-[#17cf42]">{conversion.equivalent_pkr}</span>
        </p>
        <p className="font-medium">
          Status:{" "}
          <span
            className={`${
              conversion.status === "Approved"
                ? "text-green-600"
                : conversion.status === "Rejected"
                ? "text-red-600"
                : "text-yellow-500"
            } font-semibold`}
          >
            {conversion.status}
          </span>
        </p>
      </div>
    </div>
  ))}
</div>
      )}
    </div>
  );
};

export default RewardConversionRequests;
