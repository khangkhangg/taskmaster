import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tasksAPI } from '../../services/api';

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (params) => {
  const response = await tasksAPI.getTasks(params);
  return response.data;
});

export const fetchTask = createAsyncThunk('tasks/fetchTask', async (id) => {
  const response = await tasksAPI.getTask(id);
  return response.data;
});

export const createTask = createAsyncThunk('tasks/createTask', async (taskData) => {
  const response = await tasksAPI.createTask(taskData);
  return response.data;
});

export const fetchMyTasks = createAsyncThunk('tasks/fetchMyTasks', async (params) => {
  const response = await tasksAPI.getMyTasks(params);
  return response.data;
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    myTasks: [],
    currentTask: null,
    loading: false,
    error: null,
    pagination: null,
  },
  reducers: {
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch Single Task
      .addCase(fetchTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTask.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create Task
      .addCase(createTask.fulfilled, (state, action) => {
        state.myTasks.unshift(action.payload);
      })
      // Fetch My Tasks
      .addCase(fetchMyTasks.fulfilled, (state, action) => {
        state.myTasks = action.payload;
      });
  },
});

export const { clearCurrentTask } = tasksSlice.actions;
export default tasksSlice.reducer;
