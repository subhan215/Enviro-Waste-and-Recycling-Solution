import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
const Add_Trucks = () => {
    const [data, setData] = useState({
        licensePlate: "", 
        capacity: "", 
        area_id: "" , 
    });
    const [allAreas, setAllAreas] = useState([]); // State to store available areas
    const userData = useSelector((state) => state.userData.value)
    const getNonAssignedTruckAreas = async () => {
        try {
            console.log("Fetching non-assigned areas...");
            let response = await fetch(`/api/area/get_truck_not_assigned_areas/${userData.user_id}/`, {
                headers: {
                    "Content-Type": "application/json",
                },
                method: "GET",
            });

            const responseData = await response.json();
            console.log(responseData)
            if (responseData.success) {
                setAllAreas(responseData.data); // Set the fetched areas into state
            } else {
                alert(responseData.message);
            }
        } catch (error) {
            alert(error.message);
        }
    };

    // Fetch areas when the component mounts
    useEffect(() => {
        getNonAssignedTruckAreas();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Handle form submission logic here (e.g., send truck data to API)
        console.log("Form data:", data);
        try {
            let response = await fetch(`/api/area/assign_truck_to_area/${userData.user_id}/`, {
                headers: {
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({truck_data: {...data}})
            });

            const responseData = await response.json();
            console.log(responseData)
            if (responseData.success) {
                setData({licensePlate: "" , capacity: "" , area_id: ""})
                alert("Assigned truck to area successfully!");
                setAllAreas(responseData.data); // Set the fetched areas into state
            } else {
                alert(responseData.message);
            }
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="relative flex flex-col bg-[#f8fcf9] overflow-x-hidden" style={{ fontFamily: '"Public Sans", "Noto Sans", sans-serif' }}>
            <div className="flex justify-center items-center flex-1">
                <div className="layout-content-container flex flex-col w-[512px] max-w-[960px] py-5">
                    <h2 className="text-2xl font-bold mb-4 text-center">Add Truck Information</h2>
                    <form onSubmit={handleSubmit} className="flex flex-col px-4">
                        <label className="flex flex-col min-w-40 flex-1 mb-4">
                            <input
                                type="text"
                                id="licensePlate"
                                value={data.licensePlate}
                                onChange={(e) => setData({ ...data, licensePlate: e.target.value })}
                                placeholder="License Plate"
                                className="form-input flex w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] placeholder:text-[#4e975f] text-base font-normal"
                                required
                            />
                        </label>

                        <label className="flex flex-col min-w-40 flex-1 mb-4">
                            {/* Dropdown for selecting area */}
                            <select
                                id="area"
                                value={data.area}
                                onChange={(e) => setData({ ...data, area_id: e.target.value })}
                                className="form-input flex w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] text-base font-normal"
                                required
                            >
                                <option value="" disabled selected>Select Area</option>
                                
                                {allAreas?.length > 0 ? (
                                    allAreas.map((area) => (
                                        <option key={area.area_id} value={area.area_id}>
                                            <span>{area.name}</span>
                                        </option>
                                    ))
                                ) : (
                                    <option value="">No areas available</option>
                                )}
                            </select>
                        </label>

                        <label className="flex flex-col min-w-40 flex-1 mb-4">
                            <input
                                type="number"
                                id="capacity"
                                value={data.capacity}
                                onChange={(e) => setData({ ...data, capacity: e.target.value })}
                                placeholder="Capacity (in tons)"
                                step="0.01"
                                className="form-input flex w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] placeholder:text-[#4e975f] text-base font-normal"
                                required
                            />
                        </label>

                        <button
                            type="submit"
                            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 flex-1 bg-[#17cf42] text-[#0e1b11] text-sm font-bold leading-normal"
                        >
                            Add Truck
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Add_Trucks;
