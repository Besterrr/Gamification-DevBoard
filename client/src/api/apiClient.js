import api from "./axiosClient.js";

export async function fetchProjectStats(id){
        const response = await api.get(`/api/projects/${id}/stats`)
        return response.data;
}

export async function fetchUserStats(days){
    const response = await api.get(`/api/stats/activity?days=${days}`)
    return response.data;
}