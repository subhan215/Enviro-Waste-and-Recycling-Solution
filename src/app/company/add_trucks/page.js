"use client" ; 
import React, { useState } from "react";

const Add_Trucks = () => {
    return (
        <>
        <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Add Truck Information</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="licensePlate" className="block text-gray-700">License Plate:</label>
                    <input
                        type="text"
                        id="licensePlate"
                        value={licensePlate}
                        onChange={(e) => setLicensePlate(e.target.value)}
                        className="mt-1 p-2 w-full border border-gray-300 rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="area" className="block text-gray-700">Area:</label>
                    <input
                        type="text"
                        id="area"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="mt-1 p-2 w-full border border-gray-300 rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="capacity" className="block text-gray-700">Capacity (in tons):</label>
                    <input
                        type="number"
                        id="capacity"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        step="0.01"
                        className="mt-1 p-2 w-full border border-gray-300 rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="operatingDays" className="block text-gray-700">Operating Days:</label>
                    <input
                        type="text"
                        id="operatingDays"
                        value={operatingDays}
                        onChange={(e) => setOperatingDays(e.target.value)}
                        placeholder="e.g. Mon-Fri"
                        className="mt-1 p-2 w-full border border-gray-300 rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="operatingHours" className="block text-gray-700">Operating Hours:</label>
                    <input
                        type="text"
                        id="operatingHours"
                        value={operatingHours}
                        onChange={(e) => setOperatingHours(e.target.value)}
                        placeholder="e.g. 08:00-17:00"
                        className="mt-1 p-2 w-full border border-gray-300 rounded"
                        required
                    />
                </div>
                <button type="submit" className="bg-blue-500 text-white p-2 rounded">Add Truck</button>
            </form>
        </div>
        </>
        )
} 
export default Add_Trucks ; 