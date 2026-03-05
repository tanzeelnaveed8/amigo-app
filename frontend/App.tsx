import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {QueryClient, QueryClientProvider} from 'react-query';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import Loader from './src/component/atoms/loader';
import Toast from './src/component/atoms/toast-msg';
import ContextProvider from './src/context/provider';
import Navigation from './src/navigation';
import {persistor, store} from './src/redux/store';
import {
  NotificationListener,
  requestUserPermission,
} from './src/utils/notification';
import {requestNotificationPermission} from './src/utils/permissions';
import {navigationRef} from './src/utils/navigationRef';

const App = () => {
  const queryClient = new QueryClient();

  useEffect(() => {
    requestNotificationPermission();
    requestUserPermission();
    NotificationListener();
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1, backgroundColor: '#000'}}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <NavigationContainer ref={navigationRef}>
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <ContextProvider>
                <Navigation />
                <Loader />
                <Toast />
              </ContextProvider>
            </PersistGate>
          </Provider>
        </QueryClientProvider>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;
