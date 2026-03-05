import { actionType } from "../type";

export const loginAction = (payload: any) => {
    return {
        type: actionType.LOGIN,
        payload,
    };
}; 
