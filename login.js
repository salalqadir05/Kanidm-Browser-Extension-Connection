export async function startAuth() {
    const redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;
    const scope = 'email openid groups';
    const discoveryUrl =
        `${process.env.KANIDM_BASE_URL}/oauth2/openid/your_ouath2_account_generated_in_the_terminal/.well-known/openid-configuration`;

    const state = Math.random().toString(36).slice(2);
    await chrome.storage.local.set({authState: state});

    const codeVerifier = [...Array(128)]
        .map(() => Math.random().toString(36)[2])
        .join('');
    const digest = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(codeVerifier),
    );
    const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    await chrome.storage.local.set({codeVerifier});

    let config;
    try {
        const resp = await fetch(discoveryUrl);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        config = await resp.json();
    } catch (err) {
        return;
    }
    const params = new URLSearchParams({
        client_id: process.env.KANIMD_CLIENT_ID,
        redirect_uri: redirectUri,
        scope: scope,
        response_type: 'code',
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
    });
    let authorizationUrl = `${config.authorization_endpoint}?${params.toString()}`;
    authorizationUrl = authorizationUrl.replace(':8443', ':443');
    let redirectUrl;
    try {
        redirectUrl = await new Promise((resolve, reject) => {
            chrome.identity.launchWebAuthFlow(
                {url: authorizationUrl, interactive: true},
                (url) => {
                    if (chrome.runtime.lastError) {
                        reject(
                            new Error(
                                chrome.runtime.lastError.message ||
                                JSON.stringify(chrome.runtime.lastError),
                            ),
                        );
                    } else {
                        resolve(url);
                    }
                },
            );
        });
    } catch (err) {
        return;
    }

    let code;
    let returnedState;
    try {
        const urlObj = new URL(redirectUrl);
        code = urlObj.searchParams.get('code');
        returnedState = urlObj.searchParams.get('state');
    } catch (err) {
        return null;
    }

    let storedState;
    try {
        storedState = await new Promise((resolve, reject) => {
            chrome.storage.local.get('authState', (result) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError));
                } else resolve(result.authState);
            });
        });
    } catch (err) {
        return null;
    }

    if (storedState !== returnedState) {
        return null;
    }

    chrome.storage.local.remove('authState');
    let replaceTokenEndpoint = config.token_endpoint;
    replaceTokenEndpoint = replaceTokenEndpoint.replace(':8443', ':443');
    // import it from the access_token.js
    const authToken = await getAccessToken(
        code,
        replaceTokenEndpoint,
        codeVerifier,
    );
    const payloadPersonal = await getPayloadPersonal(authToken.id_token);


    return payloadPersonal;
}