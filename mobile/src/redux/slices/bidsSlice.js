import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bidsAPI } from '../../services/api';

export const fetchMyBids = createAsyncThunk('bids/fetchMyBids', async (params) => {
  const response = await bidsAPI.getMyBids(params);
  return response.data;
});

export const createBid = createAsyncThunk('bids/createBid', async (bidData) => {
  const response = await bidsAPI.createBid(bidData);
  return response.data;
});

export const fetchTaskBids = createAsyncThunk('bids/fetchTaskBids', async (taskId) => {
  const response = await bidsAPI.getTaskBids(taskId);
  return response.data;
});

const bidsSlice = createSlice({
  name: 'bids',
  initialState: {
    myBids: [],
    taskBids: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch My Bids
      .addCase(fetchMyBids.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyBids.fulfilled, (state, action) => {
        state.loading = false;
        state.myBids = action.payload;
      })
      .addCase(fetchMyBids.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create Bid
      .addCase(createBid.fulfilled, (state, action) => {
        state.myBids.unshift(action.payload);
      })
      // Fetch Task Bids
      .addCase(fetchTaskBids.fulfilled, (state, action) => {
        state.taskBids = action.payload;
      });
  },
});

export default bidsSlice.reducer;
