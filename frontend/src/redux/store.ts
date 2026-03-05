import AsyncStorage from '@react-native-async-storage/async-storage';
import { legacy_createStore as createStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import reducers from './reducers';

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    blacklist: [''],
};

const persistedReducer = persistReducer(persistConfig, reducers);

export const store = createStore(persistedReducer);

export const persistor = persistStore(store);
