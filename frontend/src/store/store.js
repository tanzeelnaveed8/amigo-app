import { configureStore } from '@reduxjs/toolkit'
import userReducer from './slices/userSlice'
import { authApi } from './services/authApi'
import groupSlice from './slices/groupSlice'
import chanelSlice from './slices/chanelSlice'
export const store = configureStore({
  reducer: {
        user : userReducer,
        group:groupSlice,
        chanel:chanelSlice,
        [authApi.reducerPath]: authApi.reducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat([
        authApi.middleware,
       
    ])
})