import axios from "axios";
import { BASE_URL, CREATE_CHANEL, GET_CHANEL, CHANEL_BASE, UPDATE_CHANEL, GET_CHANEL_BY_ID, REMOVE_FROM_CHANEL, ADD_MEMBERS_IN_CHANEL, ADD_CHANEL_ADMIN, EXIT_CHANEL, DELETE_CHANEL, UPDATE_CHANEL_PROFILE_PIC, BAN_USER_FROM_CHANEL, UNBAN_USER_FROM_CHANEL } from "../base_url";

export const CreateChanel = async (data: any) => {
    const url = BASE_URL + CHANEL_BASE + CREATE_CHANEL;
    const response = await axios.post(url, data);
    return response.data;
};

export const UpdateChanel = async (data: any) => {
    const url = BASE_URL + CHANEL_BASE + UPDATE_CHANEL;
    const response = await axios.patch(url, data);
    return response.data;
};

export const getChanel = async (id: any) => {
    const url = BASE_URL + CHANEL_BASE + GET_CHANEL + `?userId=${id}`
    const response = await axios.get(url);
    return response.data;
};

export const getChanelById = async (id: any) => {
    const url = BASE_URL + CHANEL_BASE + GET_CHANEL_BY_ID + `?chanelId=${id}`
    const response = await axios.get(url);
    return response.data;
};

export const RemoveFromChanel = async (data: any) => {
    const url = BASE_URL + CHANEL_BASE + REMOVE_FROM_CHANEL;
    const response = await axios.patch(url, data);
    return response.data;
};

export const AddMemberInChanel = async (data: any) => {
    const url = BASE_URL + CHANEL_BASE + ADD_MEMBERS_IN_CHANEL;
    const response = await axios.patch(url, data);
    return response.data;
};

export const AddAdminInChanel = async (data: any) => {
    const url = BASE_URL + CHANEL_BASE + ADD_CHANEL_ADMIN;
    const response = await axios.patch(url, data);
    return response.data;
};

export const ExiteChanel = async (data: any) => {
    const url = BASE_URL + CHANEL_BASE + EXIT_CHANEL;
    const response = await axios.patch(url, data);
    return response.data;
};

export const DeleteChanel = async (data: any) => {
    const url = BASE_URL + CHANEL_BASE + DELETE_CHANEL + `/${data}`
    const response = await axios.delete(url);
    return response.data;
};

export const UpdateChanelProfilepic = async (data: any) => {
    const url = BASE_URL + CHANEL_BASE + UPDATE_CHANEL_PROFILE_PIC;
    const response = await axios.post(url, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const BanUserFromChanel = async (data: any) => {
    const url = BASE_URL + CHANEL_BASE + BAN_USER_FROM_CHANEL;
    const response = await axios.patch(url, data);
    return response.data;
};

export const UnbanUserFromChanel = async (data: any) => {
    const url = BASE_URL + CHANEL_BASE + UNBAN_USER_FROM_CHANEL;
    const response = await axios.patch(url, data);
    return response.data;
};
