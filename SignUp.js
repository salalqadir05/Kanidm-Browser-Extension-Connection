

export async function SignUp(your_name) {
    let response;
    let created = false;
    let groupAdded = false;
    try {
            response = await fetch(`${process.env.KANIDM_BASE_URL}/v1/person`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.KANIDM_ADMIN_TOKEN}`,
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                attrs: {
                    name: [your_name], displayname: [your_name],
                },
            }),
        });
        if (!response.ok) return false;
            response = await fetch(`${process.env.KANIDM_BASE_URL}/v1/person/${encodeURIComponent(your_name)}`, {
            headers: {
                'Authorization': `Bearer ${process.env.KANIDM_ADMIN_TOKEN}`,
                'Accept': 'application/json',
            },
        });
        if (!response.ok) return false;
        created = true;
        const userEmail = `${your_name}@localhost`;
        response = await fetch(
            `${process.env.KANIDM_BASE_URL}/v1/group/comn-extension-access/_attr/member`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.KANIDM_ADMIN_TOKEN}`,
                },
                body: JSON.stringify([userEmail]),
            },
        );
        if (!response.ok) return false;
        groupAdded = true;
        response = await fetch(
            `${process.env.KANIDM_BASE_URL}/v1/person/${encodeURIComponent(your_name)}/_credential/_update_intent`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${process.env.KANIDM_ADMIN_TOKEN}`,
                    'Accept': 'application/json',
                },
            },
        );

        if (!response.ok) {
            const err = await intentResp.json().catch(() => ({}));
            throw new Error(`Intent retrieval failed: ${err.message || intentResp.statusText}`);
        }
            const redirectUri = chrome.identity.getRedirectURL('reset_cb');
            const resetUrl = new URL(`${__kanidmBaseUrl__}/ui/reset`);
            resetUrl.searchParams.set('token', intentToken);
            resetUrl.searchParams.set('redirect_uri', redirectUri);

            chrome.identity.launchWebAuthFlow(
            {
                url: resetUrl.toString(),
                interactive: true,
            },
            (finalUrl) => {
                if (chrome.runtime.lastError) {
                    return reject(new Error(chrome.runtime.lastError.message));
                }

                console.log('Reset flow returned URL:', finalUrl);

                if (finalUrl && finalUrl.startsWith(redirectUri)) {
                    return resolve({status: 200, message: 'Password reset completed'});
                }
                return false;
            },
        );
        return {
            created,
            groupAdded,
            credentialsVerified: credentials?.status === 200 ? true : false,

        };
    } catch (err) {
        console.error('Registration flow error:', err);
        return {error: err.message};
    }
}