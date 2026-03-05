import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/SplashScreen';
import AnimatedSplashScreen from '../screens/Ghost/GhostModeSplashScreen';
import AddChanelMember from '../screens/Chanel/AddChanelMember';
import ChanelAddministrator from '../screens/Chanel/ChanelAddministrator';
import ChanelChatBox from '../screens/Chanel/ChanelChatBox';
import ChanelInfo from '../screens/Chanel/ChanelInfo';
import ChanelMedia from '../screens/Chanel/ChanelMedia';
import ChanelType from '../screens/Chanel/ChanelType';
import CreateChanel from '../screens/Chanel/CreateChanel';
import ContactSync from '../screens/DM/ContactSync';
import Home from '../screens/DM/Home';
import ContactList from '../screens/DM/ContactList';
// import Chatbox from '../screens/DM/CallVideo';
import Setting from '../screens/DM/Setting';
import GroupType from '../screens/Group/GroupType';
import CreateGroup from '../screens/Group/CreateGroup';
import GroupChatBox from '../screens/Group/GroupChatBox';
import GroupContactList from '../screens/Group/GroupContactList';
import GroupInfo from '../screens/Group/GroupInfo';
import GroupMedia from '../screens/Group/GroupMedia';
import GroupSetting from '../screens/Group/GroupSetting';
import GroupAddministrator from '../screens/Group/GroupAddministrator';
import AddGroupMember from '../screens/Group/AddGroupMember';
import AmigoScreen from '../screens/AmigoScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import VerificationScreen from '../screens/Auth/VerificationScreen';
import NewMessage from '../screens/DM/NewMessage';
import Profile from '../screens/Auth/Profile';
import AccountType from '../screens/Auth/AccountType';
import UserChat from '../screens/DM/UserChat';
import Login from '../screens/Auth/Login';
import UserProfile from '../screens/DM/UserProfile';
import UserMedia from '../screens/DM/UserMedia';
import CallVideo from '../screens/DM/CallVideo';
import ChanelSetting from '../screens/Chanel/ChanelSetting';
import RegisterScreenWithEmail from '../screens/Auth/RegisterScreenWithEmail';
import ChanelContactList from '../screens/Chanel/ChanelContactList'
import { useSelector } from 'react-redux';
import Privacy from '../screens/DM/Privacy';
const Stack = createStackNavigator();
const StackNavigator = () => {
    // const token = useSelector(state => state.user.token)

    return (
        <Stack.Navigator initialRouteName='Animated Splash Screen' screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Animated Splash Screen" component={AnimatedSplashScreen} />
            <Stack.Screen name="Splash Screen" component={SplashScreen} />

         
                        <Stack.Screen name="Amigo Screen" component={AmigoScreen} />
                        <Stack.Screen name='Add Chanel Member' component={AddChanelMember} />
                        <Stack.Screen name='Chanel Setting' component={ChanelSetting} />
                        <Stack.Screen name='Chanel Contact List' component={ChanelContactList} />
                        <Stack.Screen name='Chanel Addministrator' component={ChanelAddministrator} />
                        <Stack.Screen name='Chanel Chat Box' component={ChanelChatBox} />
                        <Stack.Screen name='Chanel Info' component={ChanelInfo} />
                        <Stack.Screen name='Chanel Media' component={ChanelMedia} />
                        <Stack.Screen name='Choose Chanel' component={ChanelType} />
                        <Stack.Screen name='Create Chanel' component={CreateChanel} />
                        <Stack.Screen name='Contact Sync' component={ContactSync} />
                        <Stack.Screen name='Home' component={Home} />
                        <Stack.Screen name='New Message' component={NewMessage} />
                        <Stack.Screen name='User Chat' component={UserChat} />
                        <Stack.Screen name='Contact List' component={ContactList} />
                        <Stack.Screen name='Call Video' component={CallVideo} />
                        <Stack.Screen name='Setting' component={Setting} />
                        <Stack.Screen name='Choose Group Type' component={GroupType} />
                        <Stack.Screen name='Create Group' component={CreateGroup} />
                        <Stack.Screen name='Group Chat Box' component={GroupChatBox} />
                        <Stack.Screen name='Group Contact List' component={GroupContactList} />
                        <Stack.Screen name='Group Info' component={GroupInfo} />
                        <Stack.Screen name='Group Media' component={GroupMedia} />
                        <Stack.Screen name='Group Setting' component={GroupSetting} />
                        <Stack.Screen name='Group Admin' component={GroupAddministrator} />
                        <Stack.Screen name='Add Member In Group' component={AddGroupMember} />
                        <Stack.Screen name='Profile' component={Profile} />
                        <Stack.Screen name='Acount Type' component={AccountType} />
                        <Stack.Screen name='User Profile' component={UserProfile} />
                        <Stack.Screen name='User Media' component={UserMedia} />
                        <Stack.Screen name='Privacy' component={Privacy} />
                  
                        <Stack.Screen name='Register With Email' component={RegisterScreenWithEmail} />
                        <Stack.Screen name="Verification Screen" component={VerificationScreen} />
                        <Stack.Screen name="Register Screen" component={RegisterScreen} />
                        <Stack.Screen name='login' component={Login} />
                   


        </Stack.Navigator>
    )
}

export default StackNavigator