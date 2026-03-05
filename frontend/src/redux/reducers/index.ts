import { actionType } from '../type';

const initailState = {
    loginData: {},
};

const reducers = (state = initailState, action: any) => {
    switch (action.type) {
        case actionType.LOGIN:
            return {
                ...state,
                loginData: action.payload,
            };

        default:
            return state;
    }
};

export default reducers;
