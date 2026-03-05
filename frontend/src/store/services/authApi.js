import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import basepath from '../../basepath'
export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({
      baseUrl: basepath,
    }),
    tagTypes: ["User"],
    endpoints: (builder) => ({
      userLogin:builder.mutation({
        query: (data) => ({
          url:"user-auth/send-otp",
          method:'POST',
          body:data
        })
      })
    })
})

export const {useUserLoginMutation} = authApi;