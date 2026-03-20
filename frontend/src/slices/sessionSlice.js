import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utility/axiosInstance';

// Async thunk to fetch active sessions from the backend on app load
export const fetchActiveSessions = createAsyncThunk(
    'session/fetchActiveSessions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/session/active');
            if (response.data.success) {
                // Return data shaped to { [patientId]: sessionId }
                const sessionMap = {};
                response.data.data.forEach(session => {
                    sessionMap[session.patientId] = session._id;
                });
                return sessionMap;
            }
            return rejectWithValue('Failed to fetch sessions');
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const initialState = {
    activeSessions: {}, // format: { [patientId]: sessionId }
    loading: false,
    error: null,
};

const sessionSlice = createSlice({
    name: 'session',
    initialState,
    reducers: {
        // Optimistic UI updates when starting or ending sessions locally
        addActiveSession: (state, action) => {
            const { patientId, sessionId } = action.payload;
            state.activeSessions[patientId] = sessionId;
        },
        removeActiveSession: (state, action) => {
            const { patientId } = action.payload;
            delete state.activeSessions[patientId];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchActiveSessions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchActiveSessions.fulfilled, (state, action) => {
                state.loading = false;
                state.activeSessions = action.payload; // Sync whole dictionary
            })
            .addCase(fetchActiveSessions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { addActiveSession, removeActiveSession } = sessionSlice.actions;

export default sessionSlice.reducer;
