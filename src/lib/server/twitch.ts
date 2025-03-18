import { CLIENT_ID, CLIENT_SECRET } from '$env/static/private';

export async function getAccessToken(): Promise<string> {
	const formData = new URLSearchParams();
	formData.append('client_id', CLIENT_ID);
	formData.append('client_secret', CLIENT_SECRET);
	formData.append('grant_type', 'client_credentials');

	const response = await fetch('https://id.twitch.tv/oauth2/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: formData
	});

	if (response.ok) {
		const { access_token: accessToken }: { access_token: string } = await response.json();
		return accessToken;
	} else {
		console.error(response);
		throw new Error(await response.text());
	}
}

export async function getUserId(channelName: string, accessToken: string) {
	const url = `https://api.twitch.tv/helix/users?login=${channelName}`;
	const response = await fetch(url, {
		headers: {
			'Client-ID': CLIENT_ID,
			Authorization: `Bearer ${accessToken}`
		}
	});

	const data = await response.json();

	console.log(data);

	if (data.data && data.data.length > 0) {
		return data.data[0].id;
	} else {
		throw new Error(`Could not find user ID for channel: ${channelName}`);
	}
}
