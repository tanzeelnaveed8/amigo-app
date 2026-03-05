import axios from "axios";
import { BASE_URL, CHECK, CONTACT_BASE, GET_ALL_CONTACT, RE_CHECK } from "../base_url";

export const CheckContactList = async (data: any) => {
    const url = BASE_URL + CONTACT_BASE + CHECK;
    const response = await axios.post(url, data);
    return response.data;
};

export const ReCheckContactList = async (data: any) => {
    const url = BASE_URL + CONTACT_BASE + RE_CHECK;
    const response = await axios.post(url, data);
    return response.data;
};

export const getAllContact = async (token?: string) => {
    const url = BASE_URL + CONTACT_BASE + GET_ALL_CONTACT;
    const headers: Record<string, string> = {};
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    const response = await axios.get(url, { headers });
    return response.data;
};
