export async function getAccessToken() {
    const redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;
    const body = new URLSearchParams({
        grant_type: your_grant_authorization_code,
        code: your_code,
        client_id: process.env.KANIMD_CLIENT_ID,
        redirect_uri: redirectUri,
        code_verifier: your_codeVerifier,
        client_secret: process.env.KANIDM_CLIENT_SECRET,
    });
    let tokenResponse;
    try {
        const response = await fetch(your_token_endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body.toString(),
        });

        if (!response.ok) return false;
        tokenResponse = await response.json();
    } catch (err) {
        console.error('Token exchange failed:', err);
        return;
    }

    return tokenResponse;
}
