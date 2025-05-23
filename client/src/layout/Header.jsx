import React, { useEffect, useState } from "react";
import settingIcon from "../assets/setting.png";
import userIcon from "../assets/user.png";
import { useDispatch, useSelector } from "react-redux";
import { toggleSettingPopup } from "../store/slices/popUpSlice.js";

const Header = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const [currentTime, setCurrentTime] = useState("");
    const [currentDate, setCurrentDate] = useState("");

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();

            const hours = now.getHours() % 12 || 12;
            const minutes = now.getMinutes().toString().padStart(2, "0");
            const ampm = now.getHours() >= 12 ? "PM" : "AM";
            setCurrentTime(`${hours}:${minutes}:${ampm}`);

            const options = { month: "long", day: "numeric", year: "numeric" };
            setCurrentDate(now.toLocaleDateString("en-US", options));
        };

        updateDateTime();

        const intervalId = setInterval(updateDateTime, 1000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <>
            <header className="absolute top-0 bg-white w-full py-4 px-6 left-0 shadow-md flex justify-between items-center">
                {/* LEFT SIDE */}
                <div className="flex items-center gap-3">
                    {user?.avatar && user.avatar.url ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
                            <img 
                                src={user.avatar.url} 
                                alt={`${user.name}'s avatar`} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = userIcon;
                                }}
                            />
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                            <img src={userIcon} alt="User Icon" className="w-6 h-6" />
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className="text-sm font-medium sm:text-lg lg:text-xl sm:font-semibold">
                            {user && user.name}
                        </span>
                        <span className="text-sm text-gray-600 font-medium">
                            {user && user.role}
                        </span>
                    </div>
                </div>
                {/* RIGHT SIDE */}
                <div className="hidden md:flex items-center gap-2">
                    <div className="flex flex-col text-sm lg:text-base items-end font-semibold">
                        <span>{currentTime}</span>
                        <span>{currentDate}</span>
                    </div>
                    <span className="bg-black h-14 w-[2px]" />
                    <img
                        src={settingIcon}
                        alt="settingIcon"
                        className="w-8 h-8 cursor-pointer hover:opacity-80"
                        onClick={() => dispatch(toggleSettingPopup())}
                    />
                </div>
            </header>
        </>
    );
};

export default Header;
