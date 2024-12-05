import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import NoDataDisplay from "../animations/NoDataDisplay";

const ResignAgreements = () => {
  const [pendingAgreements, setPendingAgreements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch the pending resignation agreements on component mount
  useEffect(() => {
    const fetchPendingAgreements = async () => {
      try {
        const response = await fetch("/api/admin/get_resign_agreements", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (data.success) {
          setPendingAgreements(data.data || []);
        } else {
          setPendingAgreements([]);
        }
      } catch (error) {
        console.error("Error fetching pending resignation agreements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingAgreements();
  }, []);

  // Function to handle action on an agreement (approve or reject)
  const handleAction = async (agreementId, action) => {
    try {
      const response = await fetch(
        "/api/admin/approve_reject_resign_agreement",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resign_id: agreementId,
            status: action, // either 'approve' or 'reject'
          }),
        }
      );

      const data = await response.json();
      console.log(data);
      if (data.success) {
        // Remove the agreement from the list once it's successfully approved or rejected
        setPendingAgreements((prevAgreements) =>
          prevAgreements.filter(
            (agreement) => agreement.resign_id !== agreementId
          )
        );
      } else {
        alert("Failed to update agreement status");
      }
    } catch (error) {
      console.error("Error updating agreement status:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="loader border-t-[#17cf42] w-12 h-12 border-4 border-gray-300 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex p-6">
      <div className="flex-grow p-6 rounded-lg">
        {pendingAgreements.length === 0 ? (
          <div className="flex items-center justify-center">
            <NoDataDisplay emptyText="No pending resignation agreements found." />
          </div>
        ) : (
          <div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingAgreements.map((agreement) => (
                <li
                  key={agreement.resign_id}
                  className="relative bg-white shadow rounded-lg p-4 border border-gray-200"
                >
                  {/* Action Icons */}
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button
                      onClick={() =>
                        handleAction(agreement.resign_id, "approved")
                      }
                      className="text-green-600 hover:text-green-800 transition-colors"
                      title="Approve"
                    >
                      <FontAwesomeIcon icon={faCheckCircle} size="lg" />
                    </button>
                    <button
                      onClick={() =>
                        handleAction(agreement.resign_id, "rejected")
                      }
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Reject"
                    >
                      <FontAwesomeIcon icon={faTimesCircle} size="lg" />
                    </button>
                  </div>

                  {/* Card Content */}
               
                  <p className="text-gray-600 mt-5">
                    Company ID / Name: {agreement.company_id} / {agreement.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Requested on:{" "}
                    {new Date(agreement.created_at).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Status: {agreement.status}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResignAgreements;
