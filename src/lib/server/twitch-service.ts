import { CLIENT_ID } from "$env/static/private";
import { getAccessToken } from "./twitch";

const BASE_URL = "https://api.twitch.tv";

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

type BadgesResponse = {
    data: BadgeSet[];
};

type BadgeSet = {
    set_id: string;
    versions: BadgeVersion[];
};

export type BadgeVersion = {
    id: string;
    image_url_1x: string;
    image_url_2x: string;
    image_url_4x: string;
    title: string;
};

class TwitchService {
    #accessToken: string | undefined;
    #globalBadges = new Map<string, Map<string, Omit<BadgeVersion, "id">>>();
    #channelBadges = new Map<number, Map<string, Map<string, Omit<BadgeVersion, "id">>>>();
    constructor() {
        this.getGlobalBadges();
        this.#channelBadges = new Map();
    }

    async getUsers(channelName: string, { accessToken }: Options): Promise<UserData[]> {
        const route = `/helix/users?login=${channelName}`;
        return (await this.#request<{ data: UserData[] }>(route, { accessToken })).data;
    }

    async getGlobalBadges(): Promise<void> {
        const route = "/helix/chat/badges/global";
        const badges: BadgesResponse = await this.#request(route, {});
        badges.data.forEach((badgeSet) => {
            const versions = new Map(
                badgeSet.versions.map(({ id, image_url_1x, image_url_2x, image_url_4x, title }) => [
                    id,
                    { image_url_4x, image_url_1x, image_url_2x, title },
                ]),
            );
            this.#globalBadges.set(badgeSet.set_id, versions);
        });
    }

    async getChannelBadges(channelId: number): Promise<void> {
        if (this.#channelBadges.has(channelId)) {
            return;
        }
        const route = `/helix/chat/badges?broadcaster_id=${channelId}`;
        const channelBadges = new Map();
        const badges: BadgesResponse = await this.#request(route, {});
        badges.data.forEach((badgeSet) => {
            const versions = new Map(
                badgeSet.versions.map(({ id, image_url_1x, image_url_2x, image_url_4x, title }) => [
                    id,
                    { image_url_4x, image_url_1x, image_url_2x, title },
                ]),
            );
            channelBadges.set(badgeSet.set_id, versions);
        });
        this.#channelBadges.set(channelId, channelBadges);
    }

    parseBadge(badge: string, channelId: number): Omit<BadgeVersion, "id"> | undefined {
        const badgeData = badge.split("/");
        const badgeName = badgeData[0]!;
        const version = badgeData[1]!;

        if (this.#channelBadges.has(channelId) && this.#channelBadges.get(channelId)?.has(badgeName)) {
            return this.#channelBadges.get(channelId)!.get(badgeName)!.get(version);
        }
        if (this.#globalBadges.has(badgeName)) {
            return this.#globalBadges.get(badgeName)?.get(version);
        }
    }

    async #request<T>(route: string, { accessToken, retries = 1 }: Options): Promise<T> {
        if (accessToken) {
            this.#accessToken = accessToken;
        } else if (!this.#accessToken) {
            this.#accessToken = await getAccessToken();
        }
        const response = await fetch(`${BASE_URL}${route}`, {
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
                return await this.#request(route, { retries: retries - 1 });
            }
            console.error(response);
            throw new Error(await response.text());
        }
    }
}

export const twitchService = new TwitchService();
