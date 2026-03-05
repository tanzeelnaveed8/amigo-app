import axios from "axios";
import { ADD_GROUP_ADMIN, ADD_MEMBERS_IN_GROUP, BASE_URL, CREATE_GROUP, DELETE_GROUP, EXIT_GROUP, GET_GROUP, GET_GROUP_BY_ID, GROUP_BASE, REMOVE_FROM_GROUP, UPDATE_GROUP, UPDATE_GROUP_PROFILE_PIC, BAN_USER_FROM_GROUP, UNBAN_USER_FROM_GROUP } from "../base_url";

export const CreateGroup = async (data: any) => {
    const url = BASE_URL + GROUP_BASE + CREATE_GROUP;
    const response = await axios.post(url, data);
    return response.data;
};

export const UpdateGroup = async (data: any) => {
    const url = BASE_URL + GROUP_BASE + UPDATE_GROUP;
    const response = await axios.patch(url, data);
    return response.data;
};

export const getGroup = async (id: any) => {
    const url = BASE_URL + GROUP_BASE + GET_GROUP + `?userId=${id}`
    const response = await axios.get(url);
    return response.data;
};

export const getGroupById = async (id: any) => {
    const url = BASE_URL + GROUP_BASE + GET_GROUP_BY_ID + `?groupId=${id}`
    const response = await axios.get(url);
    return response.data;
};

export const RemoveFromGroup = async (data: any) => {
    const url = BASE_URL + GROUP_BASE + REMOVE_FROM_GROUP;
    const response = await axios.patch(url, data);
    return response.data;
};

export const AddMemberInGroup = async (data: any) => {
    const url = BASE_URL + GROUP_BASE + ADD_MEMBERS_IN_GROUP;
    const response = await axios.patch(url, data);
    return response.data;
};

export const AddAdminInGroup = async (data: any) => {
    const url = BASE_URL + GROUP_BASE + ADD_GROUP_ADMIN;
    const response = await axios.patch(url, data);
    return response.data;
};

export const ExiteGroup = async (data: any) => {
    const url = BASE_URL + GROUP_BASE + EXIT_GROUP;
    const response = await axios.patch(url, data);
    return response.data;
};

export const DeleteGroup = async (data: any) => {
    const url = BASE_URL + GROUP_BASE + DELETE_GROUP + `/${data}`
    const response = await axios.delete(url);
    return response.data;
};

export const UpdateGroupProfilepic = async (data: any) => {
    const url = BASE_URL + GROUP_BASE + UPDATE_GROUP_PROFILE_PIC;
    const response = await axios.post(url, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const BanUserFromGroup = async (data: any) => {
    const url = BASE_URL + GROUP_BASE + BAN_USER_FROM_GROUP;
    const response = await axios.patch(url, data);
    return response.data;
};

export const UnbanUserFromGroup = async (data: any) => {
    const url = BASE_URL + GROUP_BASE + UNBAN_USER_FROM_GROUP;
    const response = await axios.patch(url, data);
    return response.data;
};
