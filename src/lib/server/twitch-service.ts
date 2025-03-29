import { CLIENT_ID } from "$env/static/private";
import { getAccessToken } from "./twitch";

export type UserData = {
    login: string;
    id: number;
    display_name: string;
    view_count: number;
    profile_image_url: string;
};

class TwitchService {
    #accessToken: string | undefined;
    constructor() {}

    async getUsers(channelName: string, retries: number = 1): Promise<UserData[]> {
        if (!this.#accessToken) {
            this.#accessToken = await getAccessToken();
        }
        const url = `https://api.twitch.tv/helix/users?login=${channelName}`;
        const response = await fetch(url, {
            headers: {
                "Client-ID": CLIENT_ID,
                Authorization: `Bearer ${this.#accessToken}`,
            },
        });
        if (response.ok) {
            return (await response.json()).data;
        } else {
            if (response.status === 401 && retries > 0) {
                this.#accessToken = await getAccessToken();
                return await this.getUsers(channelName);
            }
            console.error(response);
            throw new Error(await response.text());
        }
    }
}

export const twitchService = new TwitchService();
