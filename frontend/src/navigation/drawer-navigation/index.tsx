import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import DraweContent from './drawercontent';
import HomeScreen from '../../screen/home-screen';

const Drawer = createDrawerNavigator();

const MyDrawer = () => {
    return (
        <Drawer.Navigator
            initialRouteName={'HomeScreen'}
            screenOptions={{
                headerShown: false,
                drawerStyle: { width: 280, backgroundColor: 'transparent' },
                drawerType: 'front',
            }}
            backBehavior='history'
            drawerContent={(props: any) => <DraweContent {...props} />}>
            <Drawer.Screen name={'HomeScreen'} component={HomeScreen} />
        </Drawer.Navigator>
    );
};
export default MyDrawer;
