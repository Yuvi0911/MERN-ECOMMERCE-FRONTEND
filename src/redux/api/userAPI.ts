import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AllUsersResponse, DeleteUserRequest, MessageResponse, UserResponse } from "../../types/api-types";
import { User } from "../../types/types";
//axios ki help se hum http request kr skte h nodejs se
import axios from "axios";


export const userAPI = createApi({
    //isme humne basically jo backend me api bnayi h unhe frontend me handle krne k liye code likh rhe h 

    reducerPath: "userApi",

    //is se hum base query ko le rhe h jiske aage hum main api ki query lgaye ge jaise ki new,update,delete etc.
    // http://localhost:3000/api/v1/user/
    baseQuery: fetchBaseQuery({baseUrl: `${import.meta.env.VITE_SERVER}/api/v1/user/`}),
    tagTypes: ["users"],
    endpoints:(builder)=>({

        //builder me 2 method hote h mutation and query. 
        //mutation method ko hum tab use krte h jab hume data ko manipulate krna hota h jaise ki user create krna, update krna etc. 
        //query method ka use hum tab krte h jab hume data get krna ho database se.
        login: builder.mutation<MessageResponse, User>({
            //return type MessageResponse hoga jo ki humne api-types me bnaya h aur user ka type User hoga jo ki humne types.ts me bnaya h.
            query: (user)=>({
                url: "new",
                method: "POST",
                body: user,
            }),
            invalidatesTags: ["users"],
        }),
        deleteUser: builder.mutation<MessageResponse, DeleteUserRequest>({
            query: ({userId, adminUserId}) => ({
                url: `${userId}?id=${adminUserId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["users"]
        }),

        allUsers: builder.query<AllUsersResponse, string>({
            query: (id) =>`all?id=${id}`,
            providesTags: ["users"],
        })
    }),
});

// jab bhi 404 axiosError aaye aur id mile jo ki not found h toh iska matlab ye h ki vo id firebase me exist krti h lekin mongodb me nhi h toh hum us id vale user ko firebase se delete kr dege. 
export const getUser = async (id: string)=>{
    try{
        // console.log("1");
        const {data}: {data: UserResponse} = await axios.get(`${import.meta.env.VITE_SERVER}/api/v1/user/${id}`)
        // console.log("2");
        return data;
    }
    catch (error) {
        console.log(error)
        throw error;
    }
}

export const {useLoginMutation, useAllUsersQuery, useDeleteUserMutation} = userAPI;