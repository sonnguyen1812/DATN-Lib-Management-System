import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { toggleAddNewAdminPopup } from "./popUpSlice";

const userSlice = createSlice({
    name: "user",
    initialState: {
        users: [],
        loading: false,
        error: null,
        message: null,
    },
    reducers: {
        fetchAllUsersRequest(state) {
            state.loading = true;
            state.error = null;
            state.message = null;
        },
        fetchAllUsersSuccess(state, action) {
            state.loading = false;
            state.users = action.payload;
            state.error = null;
        },
        fetchAllUsersFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
        addNewAdminRequest(state) {
            state.loading = true;
            state.error = null;
            state.message = null;
        },
        addNewAdminSuccess(state, action) {
            state.loading = false;
            state.message = action.payload;
            state.error = null;
        },
        addNewAdminFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
        toggleUserLockRequest(state) {
            state.loading = true;
            state.error = null;
            state.message = null;
        },
        toggleUserLockSuccess(state, action) {
            state.loading = false;
            state.message = action.payload.message;
            // Cập nhật thông tin người dùng trong danh sách
            state.users = state.users.map(user => 
                user._id === action.payload.user._id ? action.payload.user : user
            );
        },
        toggleUserLockFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
        resetUserState(state) {
            state.error = null;
            state.message = null;
            state.loading = false;
        },
    },
});

export const fetchAllUsers = () => async (dispatch) => {
    dispatch(userSlice.actions.fetchAllUsersRequest());
    await axios
        .get("http://localhost:4000/api/v1/user/all", { withCredentials: true })
        .then((res) => {
            dispatch(userSlice.actions.fetchAllUsersSuccess(res.data.users));
        })
        .catch((err) => {
            dispatch(
                userSlice.actions.fetchAllUsersFailed(err.response?.data?.message || "Failed to fetch users")
            );
        });
};

export const addNewAdmin = (data) => async (dispatch) => {
    dispatch(userSlice.actions.addNewAdminRequest());
    await axios
        .post("http://localhost:4000/api/v1/user/add/new-admin", data, {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
        })
        .then((res) => {
            dispatch(userSlice.actions.addNewAdminSuccess());
            toast.success(res.data.message);
            dispatch(toggleAddNewAdminPopup());
        })
        .catch((err) => {
            dispatch(userSlice.actions.addNewAdminFailed());
            toast.error(err.response.data.message);
        });
};

export const toggleUserLock = (userId) => async (dispatch) => {
    dispatch(userSlice.actions.toggleUserLockRequest());
    
    await axios
        .put(`http://localhost:4000/api/v1/user/toggle-lock/${userId}`, {}, 
            { withCredentials: true }
        )
        .then((res) => {
            dispatch(userSlice.actions.toggleUserLockSuccess(res.data));
            toast.success(res.data.message);
        })
        .catch((err) => {
            dispatch(
                userSlice.actions.toggleUserLockFailed(
                    err.response?.data?.message || "Failed to toggle user lock status"
                )
            );
            toast.error(err.response?.data?.message || "Failed to toggle user lock status");
        });
};

export const { resetUserState } = userSlice.actions;
export default userSlice.reducer;
