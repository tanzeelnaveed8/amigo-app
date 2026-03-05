import { createSlice } from '@reduxjs/toolkit'



const initialState = {
  _id: "",
  name: "",
  lastName: "",
  firstName: "",
  email: "",
  userProfile: "",
  bio: "",
  isDarkMode: false,
  isNotificationEnable: false,
  isPhoneVisible: false,
  token: null,
  onlineUser: [],
  socketConnection: null,
  isLoading: false,
  phone: '',
  contactList: [],
  userData: '',
  selectSms: '',
  conversationId: null,
  userId:'',
  userAccountType:'',
  acountPrivacy:''
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state._id = action.payload?._id
      state.name = action.payload?.firstName + " " + action.payload?.lastName
      state.firstName = action.payload?.firstName
      state.lastName = action.payload?.lastName
      state.userName = action.payload?.userName
      state.phone = action.payload?.phone
      state.userProfile = action.payload?.userProfile
      state.bio = action.payload?.bio
      state.isDarkMode = action.payload?.isDarkMode
      state.isNotificationEnable = action.payload?.isNotificationEnable
      state.isPhoneVisible = action.payload?.isPhoneVisible
      state.userAccountType=action.payload?.userAccountType
      state.acountPrivacy=action.payload?.acountPrivacy
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload
    },
    setSMS: (state, action) => {
      state.selectSms = action.payload
    },
    setUserId:(state,action)=>{
      state.userId=action.payload
    },
    setPhones: (state, action) => {
      state.phone = action.payload
    },
    setToken: (state, action) => {
      state.token = action.payload
    },
    setConversationId: (state, action) => {
      state.conversationId = action.payload
    },
    setContactList: (state, action) => {
      state.contactList = action.payload
    },
    setUserData: (state, action) => {
      state.userData = action.payload
    },
    logout: (state, action) => {
      state._id = ""
      state.name = ""
      state.email = ""
      state.profile_pic = ""
      state.token = ""
      state.socketConnection = null,
      state.firstName = ""
      state.lastName = ""
      state.bio = ""
      state.contactList = ""
      state.isDarkMode = false
      state.isNotificationEnable = false
      state.isPhoneVisible = false
      state.onlineUser = []
      state.phone = ''
      state.selectSms = ''
      state.socketConnection = null
      state.userData = ''
      state.userProfile = ''

    },
    setOnlineUser: (state, action) => {
      state.onlineUser = action.payload
    },
    setSocketConnection: (state, action) => {
      state.socketConnection = action.payload
    }
  },
})

// Action creators are generated for each case reducer function
export const { setUser,
  setToken,
  logout,
  setPhones,
  setIsLoading,
  setOnlineUser,
  setSocketConnection,
  setContactList,
  setUserData,
  setSMS,
  setConversationId,
  setUserId
} = userSlice.actions

export default userSlice.reducer