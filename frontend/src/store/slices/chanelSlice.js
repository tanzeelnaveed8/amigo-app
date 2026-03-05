import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    chanelId: '',
    chanelData:null,
    chanelParticipent:[]
}

export const chanelSlice = createSlice  ({
    name: 'user',
    initialState,
    reducers:{
        setChanelId:(state, action) =>{
            state.chanelId=action.payload
        },
        setChanelData:(state, action)=>{
            state.chanelData=action.payload

        },
        setChanelParticipent:(state,action)=>{
            state.chanelParticipent=action.payload
        }
    }
})
export const {setChanelId,setChanelData,setChanelParticipent} = chanelSlice.actions
export default chanelSlice.reducer
