import { APi } from "./CenteralAPI";


const User=APi.injectEndpoints({
endpoints:(builder)=>({
getUser:builder.query({
query:(id)=>`/User?_id=${id}`,
providesTags:[{type:'User',_id:'List'}]


}),
updateUser:builder.mutation({
query:(userData)=>({

url:'/User/Update',
method:'PUT',
body:userData



    

}),
invalidatesTags:[{type:'User',_id:'List'}]

}),
updatePassword:builder.mutation({
query:(password)=>({
url:'/User/Password',
method:'PUT',
body:password


})


}),
UpdateProfile:builder.mutation({
      query: (payload) => ({
        url: "/User/updateUserProfile",
        method: "PATCH",
        body: payload, 
      }),
     providesTags:[{type:'User',_id:'List'}]
    }),




})





})
export const {use,useGetUserQuery,useUpdateUserMutation,useUpdatePasswordMutation,useUpdateProfileMutation}=User