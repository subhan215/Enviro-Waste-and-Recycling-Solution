import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import NoDataDisplay from "../animations/NoDataDisplay";
import Admin_loader from "../ui/Admin_loader"
import Alert from "../ui/Alert";
const ResignAgreements = () => {
  const [pendingAgreements, setPendingAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState([]);
  const showAlert = (type, message) => {
    const id = Date.now();
    setAlert([...alert, { id, type, message }]);
    setTimeout(() => {
      setAlert((alerts) => alerts.filter((alert) => alert.id !== id));
    }, 4000);
  };
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
        showAlert('warning' , `Failed to update agreement status`)
      }
    } catch (error) {
      console.error("Error updating agreement status:", error);
    }
  };

  if (loading) {
    return <Admin_loader></Admin_loader>
  }

  return (
    <div className="flex p-6">
      {alert.map((alert) => (
    <Alert
      key={alert.id}
      type={alert.type}
      message={alert.message}
      onClose={() => setAlert((alert) => alert.filter((a) => a.id !== alert.id))}
    />
  ))}
  <div className="flex-grow p-6 rounded-lg">
    {pendingAgreements.length === 0 ? (
      <div className="flex items-center justify-center">
        <NoDataDisplay emptyText="No pending resignation agreements found." />
      </div>
    ) : (
      <div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {pendingAgreements.map((agreement) => (
            <li
              key={agreement.resign_id}
              className="relative bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg p-6 border border-gray-200"
            >
              {/* Action Icons */}
              <div className="absolute top-4 right-4 flex space-x-3">
                <button
                  onClick={() =>
                    handleAction(agreement.resign_id, "approved")
                  }
                  className="text-green-600 hover:text-green-800 transition-colors p-2 rounded-full"
                  title="Approve"
                >
                  <FontAwesomeIcon icon={faCheckCircle} size="lg" />
                </button>
                <button
                  onClick={() =>
                    handleAction(agreement.resign_id, "rejected")
                  }
                  className="text-red-600 hover:text-red-800 transition-colors p-2 rounded-full"
                  title="Reject"
                >
                  <FontAwesomeIcon icon={faTimesCircle} size="lg" />
                </button>
              </div>

              {/* Card Content */}
              <div className="mt-8">
                <p className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  Company ID / Name: {agreement.company_id} / {agreement.name}
                </p>
                <p className="text-sm sm:sm text-gray-600">
                  Requested on: {new Date(agreement.created_at).toLocaleString()}
                </p>
                <p className="text-sm sm:sm text-gray-600">
                  Status:{" "}
                  <span
                    className={`${
                      agreement.status === "Approved"
                        ? "text-green-600"
                        : agreement.status === "Rejected"
                        ? "text-red-600"
                        : "text-yellow-600"
                    } font-semibold`}
                  >
                    {agreement.status}
                  </span>
                </p>
              </div>
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
