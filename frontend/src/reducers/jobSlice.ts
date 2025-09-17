import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { JobDescription } from "../types";

interface JobDescriptionState {
  items: JobDescription[];
  loading: boolean;
  error?: string;
}

const initialState: JobDescriptionState = {
  items: [],
  loading: false,
  error: undefined,
};

// Async thunks for API calls
export const getAllJobDescriptions = createAsyncThunk<JobDescription[]>(
  "jobs/get",
  async () => {
    const res = await fetch("https://127.0.0.1:8000/get_job_descriptions");
    const data = await res.json() as JobDescription[]
    return data
  }
);

export const createJobDescription = createAsyncThunk<
  JobDescription, 
  Omit<JobDescription, 'id' | 'createdAt' | 'updatedAt'>
>(
  "jobs/create",
  async (job) => {
    const res = await fetch("https://127.0.0.1:8000/create_job_description", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(job),
    });

    const data = await res.json() as JobDescription
    return data;
  }
);

export const updateJobDescription = createAsyncThunk(
  "jobs/update",
  async ({ id, updatedJobDescription }: { id: string; updatedJobDescription: Partial<JobDescription> }) => {
    const res = await fetch(`https://127.0.0.1:8000/update_job_description/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedJobDescription),
    });
    const data = await res.json() as JobDescription
    return data;
  }
);

const jobSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    clearError(state) {
      state.error = undefined;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch
      .addCase(getAllJobDescriptions.pending, state => { state.loading = true; })
      .addCase(getAllJobDescriptions.fulfilled, (state, action: PayloadAction<JobDescription[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getAllJobDescriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create
      .addCase(createJobDescription.fulfilled, (state, action: PayloadAction<JobDescription>) => {
        console.log("Payload received:", action.payload);
        state.items.push(action.payload);
      })
      // Update
      .addCase(updateJobDescription.fulfilled, (state, action: PayloadAction<JobDescription>) => {
        const index = state.items.findIndex(j => j.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      });
  }
});

export const { clearError } = jobSlice.actions;

export default jobSlice.reducer;
