export async function apiFetch(url, options = {}, accessToken, refreshToken, onTokensUpdate, onLogout) {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${accessToken}`
        }
    });
    if (!(response.status === 401)) {
        return response;
    }
    const newResponse = await fetch('http://localhost:5000/api/auth/refresh', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({refreshToken})
    })
    if(!newResponse.ok){
        onLogout();
        return response;
    }
    const data = await newResponse.json();
    const newAccessToken = data.accessToken;
    const newRefreshToken = data.refreshToken;
    onTokensUpdate(newAccessToken, newRefreshToken);
    return apiFetch(url, options, newAccessToken, newRefreshToken, onTokensUpdate, onLogout);
}

export async function fetchProjectStats(id, accessToken, refreshToken, updateTokens, logout){
    const response = await apiFetch(`http://localhost:5000/api/projects/${id}/stats`,
        {method: 'GET'},
        accessToken,
        refreshToken,
        updateTokens,
        logout)
    const data = await response.json();
    if(!response.ok){
        throw new Error(data.message);
    }
    return data;
}

export async function fetchUserStats(days, accessToken, refreshToken, updateTokens, logout){
    const response = await apiFetch(`http://localhost:5000/api/stats/activity?days=${days}`,
        {method: 'GET'},
        accessToken,
        refreshToken,
        updateTokens,
        logout)
    const data = await response.json();
    if(!response.ok){
        throw new Error(data.message);
    }
    return data;
}