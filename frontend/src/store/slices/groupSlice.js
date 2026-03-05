import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    groupId: '',
    groupData:null,
    groupParticipent:[]
}

export const groupSlice = createSlice  ({
    name: 'user',
    initialState,
    reducers:{
        setGroupId:(state, action) =>{
            state.groupId=action.payload
        },
        setGroupData:(state, action)=>{
            state.groupData=action.payload

        },
        setGroupParticipent:(state,action)=>{
            state.groupParticipent=action.payload
        }
    }
})
export const {setGroupId,setGroupData,setGroupParticipent} = groupSlice.actions
export default groupSlice.reducer
