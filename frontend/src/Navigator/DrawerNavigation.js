import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react'
// import Home from '../screens/DM/Home';
// import StackNavigation from '../StackNavigation';
import StackNavigator from './StackNavigator';
import CustomDrawer from './CustomDrawer';

const Drawer = createDrawerNavigator();
const DrawerNavigation = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{ headerShown: false }} >
      <Drawer.Screen name='Main' component={StackNavigator} />
    </Drawer.Navigator>
  )
}

export default DrawerNavigation