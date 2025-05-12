import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "../layout/Header";
import { Lock, Unlock } from "lucide-react";
import { toggleUserLock } from "../store/slices/userSlice";

const Users = () => {
    const dispatch = useDispatch();
    const { users, loading } = useSelector((state) => state.user);

    const formatDate = (timeStamp) => {
        const date = new Date(timeStamp);
        const formattedDate = `${String(date.getDate()).padStart(
            2,
            "0"
        )}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
            date.getFullYear()
        )}`;
        const formattedTime = `${String(date.getHours()).padStart(
            2,
            "0"
        )}:${String(date.getMinutes()).padStart(2, "0")}:${String(
            date.getSeconds()
        ).padStart(2, "0")}`;
        const result = `${formattedDate} ${formattedTime}`;
        return result;
    };

    const handleToggleLock = (userId) => {
        dispatch(toggleUserLock(userId));
    };

    return (
        <>
            <main className="relative flex-1 p-6 pt-28">
                <Header />
                {/* Sub Header */}
                <header className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
                    <h2 className="text-xl font-medium md:text-2xl md:font-semibold">
                        Register Users
                    </h2>
                </header>

                {/* Table */}
                {users && users.filter((u) => u.role === "User").length > 0 ? (
                    <div className="mt-6 overflow-auto bg-white rounded-md shadow-lg">
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="px-4 py-2 text-left">ID</th>
                                    <th className="px-4 py-2 text-left">
                                        Name
                                    </th>
                                    <th className="px-4 py-2 text-left">
                                        Email
                                    </th>
                                    <th className="px-4 py-2 text-left">
                                        Role
                                    </th>
                                    <th className="px-4 py-2 text-center">
                                        No. of Books borrowed
                                    </th>
                                    <th className="px-4 py-2 text-center">
                                        Status
                                    </th>
                                    <th className="px-4 py-2 text-center">
                                        Registered On
                                    </th>
                                    <th className="px-4 py-2 text-center">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {users
                                    .filter((u) => u.role === "User")
                                    .map((user, index) => (
                                        <tr
                                            key={user._id}
                                            className={
                                                (index + 1) % 2 === 0
                                                    ? "bg-gray-50"
                                                    : ""
                                            }
                                        >
                                            <td className="px-4 py-2">
                                                {index + 1}
                                            </td>
                                            <td className="px-4 py-2">
                                                {user.name}
                                            </td>
                                            <td className="px-4 py-2">
                                                {user.email}
                                            </td>
                                            <td className="px-4 py-2">
                                                {user.role}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                {user?.borrowedBooks.length}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                {user.isLocked ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        Locked
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                {formatDate(user.createdAt)}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <button
                                                    onClick={() => handleToggleLock(user._id)}
                                                    className={`px-3 py-1 text-sm text-white rounded-md ${
                                                        user.isLocked
                                                            ? "bg-green-600 hover:bg-green-700"
                                                            : "bg-slate-700 hover:bg-slate-800"
                                                    }`}
                                                    disabled={loading}
                                                >
                                                    {user.isLocked ? (
                                                        <div className="flex items-center">
                                                            <Unlock className="w-4 h-4 mr-1" /> Unlock
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center">
                                                            <Lock className="w-4 h-4 mr-1" /> Lock
                                                        </div>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <h3 className="text-3xl mt-5 font-medium">No registered users found in library.</h3>
                )}
            </main>
        </>
    );
};

export default Users;
