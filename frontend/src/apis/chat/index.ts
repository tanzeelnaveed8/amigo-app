import axios from "axios";
import { ADD_LIKEDISLIKE, ADD_REACTION, BASE_URL, CHAT_BASE, CLEAR_CHAT_HISTORY, GET_LIKESTATUS, GET_REACTION } from "../base_url";

export const ClearChat = async (data: any) => {
    const url = BASE_URL + CHAT_BASE + CLEAR_CHAT_HISTORY;
    const response = await axios.post(url, data);
    return response.data;
};

export const AddReaction = async (data: any) => {
    const url = BASE_URL + CHAT_BASE + ADD_REACTION;
    const response = await axios.post(url, data);
    return response.data;
};

export const GetReaction = async (data: any) => {
    const url = BASE_URL + CHAT_BASE + GET_REACTION + `/${data}`
    const response = await axios.get(url);
    return response.data;
};

export const AddLikeDislike = async (data: any) => {
    const url = BASE_URL + CHAT_BASE + ADD_LIKEDISLIKE;
    const response = await axios.post(url, data);
    return response.data;
};

export const GetLikeDislikeStatus = async (data: any) => {
    const url = BASE_URL + CHAT_BASE + GET_LIKESTATUS + `/${data}`
    const response = await axios.get(url);
    return response.data;
};
