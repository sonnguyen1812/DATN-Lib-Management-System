import { useEffect } from "react";
import logo_with_title from "../assets/logo-with-title.png";
import { useDispatch, useSelector } from "react-redux";
import { logout, resetAuthSlice } from "../store/slices/authSlice.js";
import { toast } from "react-toastify";
import PropTypes from 'prop-types';
import {
    toggleAddNewAdminPopup,
    toggleSettingPopup,
} from "../store/slices/popUpSlice.js";
import AddNewAdmin from "../popups/AddNewAdmin.jsx";
import SettingPopup from "../popups/SettingPopup.jsx";

// Import icons from Lucide React
import { 
  LayoutDashboard, 
  BookOpen, 
  Library, 
  Users, 
  UserPlus, 
  Settings, 
  LogOut, 
  X
} from "lucide-react";

const SideBar = ({ isSideBarOpen, setIsSideBarOpen, setSelectedComponent }) => {
    const dispatch = useDispatch();
    const { addNewAdminPopup, settingPopup } = useSelector(
        (state) => state.popup
    );
    const { loading, error, message, user, isAuthenticated } = useSelector(
        (state) => state.auth
    );
    const handleLogout = () => {
        dispatch(logout());
    };
    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(resetAuthSlice());
        }
        if (message) {
            toast.success(message);
            dispatch(resetAuthSlice());
        }
    }, [dispatch, isAuthenticated, error, loading, message]);

    return (
        <>
            <aside
                className={`${
                    isSideBarOpen ? "left-0" : "-left-full"
                } z-10 transition-all duration-700 md:relative md:left-0 flex
         w-64 bg-slate-900 text-white flex-col h-full shadow-lg`}
                style={{ position: "fixed" }}
            >
                <div className="px-4 py-4 border-b border-slate-700 flex justify-center">
                    <img src={logo_with_title} alt="Logo With Title" className="w-auto max-h-16" />
                </div>
                <nav className="flex-1 px-3 py-4 space-y-1">
                    <button
                        data-component="Dashboard"
                        className="w-full py-2 px-3 font-medium text-slate-200 rounded-md hover:bg-slate-800 transition-colors flex items-center space-x-3"
                        onClick={() => setSelectedComponent("Dashboard")}
                    >
                        <LayoutDashboard className="h-5 w-5 text-slate-400" />
                        <span>Dashboard</span>
                    </button>
                    <button
                        data-component="Books"
                        className="w-full py-2 px-3 font-medium text-slate-200 rounded-md hover:bg-slate-800 transition-colors flex items-center space-x-3"
                        onClick={() => setSelectedComponent("Books")}
                    >
                        <BookOpen className="h-5 w-5 text-slate-400" />
                        <span>Books</span>
                    </button>
                    {isAuthenticated && user?.role === "Admin" && (
                        <>
                            <button
                                data-component="Catalog"
                                className="w-full py-2 px-3 font-medium text-slate-200 rounded-md hover:bg-slate-800 transition-colors flex items-center space-x-3"
                                onClick={() => setSelectedComponent("Catalog")}
                            >
                                <Library className="h-5 w-5 text-slate-400" />
                                <span>Catalog</span>
                            </button>
                            <button
                                data-component="Users"
                                className="w-full py-2 px-3 font-medium text-slate-200 rounded-md hover:bg-slate-800 transition-colors flex items-center space-x-3"
                                onClick={() => setSelectedComponent("Users")}
                            >
                                <Users className="h-5 w-5 text-slate-400" />
                                <span>Users</span>
                            </button>
                            <button
                                className="w-full py-2 px-3 font-medium text-slate-200 rounded-md hover:bg-slate-800 transition-colors flex items-center space-x-3"
                                onClick={() =>
                                    dispatch(toggleAddNewAdminPopup())
                                }
                            >
                                <UserPlus className="h-5 w-5 text-slate-400" />
                                <span>Add New Admin</span>
                            </button>
                        </>
                    )}
                    {isAuthenticated && user?.role === "User" && (
                        <button
                            data-component="My Borrowed Books"
                            className="w-full py-2 px-3 font-medium text-slate-200 rounded-md hover:bg-slate-800 transition-colors flex items-center space-x-3"
                            onClick={() =>
                                setSelectedComponent("My Borrowed Books")
                            }
                        >
                            <Library className="h-5 w-5 text-slate-400" />
                            <span>My Borrowed Books</span>
                        </button>
                    )}
                    <button
                        className="w-full py-2 px-3 font-medium text-slate-200 rounded-md hover:bg-slate-800 transition-colors flex items-center space-x-3"
                        onClick={() => dispatch(toggleSettingPopup())}
                    >
                        <Settings className="h-5 w-5 text-slate-400" />
                        <span>Update Credentials</span>
                    </button>
                </nav>
                <div className="px-3 py-4 border-t border-slate-700">
                    <button
                        className="w-full py-2 px-3 font-medium text-slate-200 rounded-md hover:bg-slate-800 transition-colors flex items-center space-x-3"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-5 w-5 text-slate-400" />
                        <span>Log out</span>
                    </button>
                </div>
                <button
                    onClick={() => setIsSideBarOpen(!isSideBarOpen)}
                    className="absolute top-4 right-4 bg-slate-800 p-1 rounded-full hover:bg-slate-700 md:hidden"
                >
                    <X className="h-5 w-5 text-slate-200" />
                </button>
            </aside>
            {addNewAdminPopup && <AddNewAdmin />}
            {settingPopup && <SettingPopup />}
        </>
    );
};

SideBar.propTypes = {
    isSideBarOpen: PropTypes.bool.isRequired,
    setIsSideBarOpen: PropTypes.func.isRequired,
    setSelectedComponent: PropTypes.func.isRequired
};

export default SideBar;
