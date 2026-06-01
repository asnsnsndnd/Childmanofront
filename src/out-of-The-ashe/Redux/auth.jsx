import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";

const API_URL = import.meta.env.VITE_DEFAULT_BACKEND ;

const initialState={
    id:null,
    role:null,
    isloading:false,
    isAuthenticate:false,
    error:null,
    token:null,
    permissions:null
}

export const LoginUser=createAsyncThunk(
      'auth',
    async(credentials,thunksAPI)=>{

             try{

                const response=await fetch(`${API_URL}/login`,{
                    method:'post',
                    headers:{
                         'Content-Type':'application/json'
                       },
                    body:JSON.stringify(credentials)

                  })
              const data=await response.json();
                if(!data.ok){
                 return thunksAPI.rejectWithValue(data.msg);

               }
               return data;
            



            }catch(error){
            return thunksAPI.rejectWithValue(data.msg);




            }



}

)
export const authSlice=createSlice({

      name:'auth',
      initialState,
      reducers:{
         logout:(state)=>{
            state.id=null;
            state.isAuthenticate=false,
            state.error=null,
            state.token=null,
            state.role=null,
            state.permissions=null
         }
      },
      extraReducers:(builder)=>{

               builder.addCase(LoginUser.pending,(state,action)=>{
                    state.isloading=true;
                    state.error=null;

                     });
               builder.addCase(LoginUser.fulfilled,(state,action)=>{

                  state.id=action.payload.id;
                  state.role=action.payload.role
                  state.token=action.payload.token;
                  state.permissions=action.payload.permissions
                  state.isAuthenticate=true;
                  state.isloading=false,
                  state.error=null;
              });
            builder.addCase(LoginUser.rejected,(state,action)=>{
                  state.error=action.payload;
                  state.isloading=false;
                  state.id=null;
                  state.role=null;
                  state.token=null;
                  state.permissions=null


                   })

      }


})
export const  {logout}=authSlice.actions
export default authSlice.reducer
