import { configureStore } from "@reduxjs/toolkit";
import jobReducer from "./jobSlice";

export const store = configureStore({
  reducer: {
    jobs: jobReducer,
  },
});

// Infer types for useSelector and useDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
