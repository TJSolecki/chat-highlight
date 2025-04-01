import { CLIENT_ID } from "$env/static/private";
import { getAccessToken } from "./twitch";

export type UserData = {
    login: string;
    id: number;
    display_name: string;
    view_count: number;
    profile_image_url: string;
};

type Options = {
    retries?: number;
    accessToken?: string;
};

class TwitchService {
    #accessToken: string | undefined;
    constructor() {}

    async getUsers(channelName: string, { retries = 1, accessToken }: Options): Promise<UserData[]> {
        const url = `https://api.twitch.tv/helix/users?login=${channelName}`;
        return (await this.#request<{ data: UserData[] }>(url, { retries, accessToken })).data;
    }

    async #request<T>(url: string, { accessToken, retries = 1 }: Options): Promise<T> {
        if (accessToken) {
            this.#accessToken = accessToken;
        } else if (!this.#accessToken) {
            this.#accessToken = await getAccessToken();
        }
        const response = await fetch(url, {
            headers: {
                "Client-ID": CLIENT_ID,
                Authorization: `Bearer ${this.#accessToken}`,
            },
        });
        if (response.ok) {
            return await response.json();
        } else {
            if (response.status === 401 && retries > 0) {
                this.#accessToken = await getAccessToken();
                return await this.#request(url, { retries: retries - 1 });
            }
            console.error(response);
            throw new Error(await response.text());
        }
    }
}

export const twitchService = new TwitchService();
