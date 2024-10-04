"use client"; // Ensure the component is treated as a client component
import { Router } from "next/router";
import React, { useState } from "react";
const ComplaintPage = () => {
  const [complaintData, setComplaintData] = useState({
    type: "",
    description: "",
    contactInfo: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setComplaintData({ ...complaintData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Sending complaint data:", complaintData); // Debugging output

    try {
      let response = await fetch("http://localhost:5000/api/v1/complaints", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST", // Change to POST for sending data
        body: JSON.stringify(complaintData), // Send the complaint data as JSON
      });

      const responseData = await response.json();
      console.log("Response data:", responseData); // Debugging output

      if (response.ok) {
        alert("Complaint submitted successfully!");
        Router.push("/"); // Use Next.js router for redirection
      } else {
        alert(responseData.message);
      }
    } catch (error) {
      console.error("Error occurred:", error); // More detailed error logging
      alert("An error occurred: " + error.message);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-[#f8fcf9]">
      <div className="flex justify-center items-center flex-1">
        <div className="layout-content-container flex flex-col w-[512px] max-w-[960px] py-5">
          {/* Complaint Bar */}
          <div className="flex justify-between items-center mb-4 bg-[#e7f3ea] p-2 rounded-xl">
            <h2 className="text-[#0e1b11] font-bold">Complaint</h2>
            <button
              onClick={() => alert("Proceeding...")} // Placeholder action for the proceed button
              className="bg-[#17cf42] text-white px-4 py-2 rounded-xl font-bold"
            >
              Proceed
            </button>
          </div>

          <h1 className="text-center text-2xl font-bold mb-4">Submit a Complaint</h1>
          <form onSubmit={handleSubmit} className="flex flex-col px-4">
            <label className="flex flex-col mb-4">
              <span className="text-[#0e1b11] mb-1">Complaint Type</span>
              <select
                name="type"
                className="form-input h-10 p-2 rounded-xl border-none bg-[#e7f3ea]"
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select complaint type</option>
                <option value="service">Service</option>
                <option value="billing">Billing</option>
                <option value="product">Product</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label className="flex flex-col mb-4">
              <span className="text-[#0e1b11] mb-1">Description</span>
              <textarea
                name="description"
                className="form-input h-20 p-2 rounded-xl border-none bg-[#e7f3ea]"
                placeholder="Describe your complaint"
                onChange={handleChange}
                required
              ></textarea>
            </label>

            <label className="flex flex-col mb-4">
              <span className="text-[#0e1b11] mb-1">Contact Information</span>
              <input
                type="text"
                name="contactInfo"
                className="form-input h-10 p-2 rounded-xl border-none bg-[#e7f3ea]"
                placeholder="Email or phone number"
                onChange={handleChange}
                required
              />
            </label>

            <button
              type="submit"
              className="flex items-center justify-center h-10 bg-[#17cf42] text-white rounded-xl font-bold"
            >
              Submit Complaint
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComplaintPage;
