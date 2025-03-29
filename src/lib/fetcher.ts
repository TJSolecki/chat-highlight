import twitchEmoticons, {
    type BTTVEmote,
    type FFZEmote,
    type SevenTVEmote,
    type TwitchEmote,
} from "@mkody/twitch-emoticons";
import { CLIENT_ID, CLIENT_SECRET } from "$env/static/private";
const { EmoteFetcher, Collection } = twitchEmoticons;

type ChannelEmotes = {
    ffzEmotes: Map<string, FFZEmote>;
    bttvEmotes: Map<string, BTTVEmote>;
    sevenTvEmotes: Map<string, SevenTVEmote>;
    twitchEmotes: Map<string, TwitchEmote>;
};

export type ChannelEmote = FFZEmote | BTTVEmote | SevenTVEmote | TwitchEmote;

export type EmoteLink = {
    href: string;
    name: string;
};

class EmoteFetcherService {
    fetcher = new EmoteFetcher(CLIENT_ID, CLIENT_SECRET);
    emotesByChannel = new Map<number, ChannelEmotes>();
    constructor() {
        this.#fetchGlobalEmotes();
    }

    async #fetchGlobalEmotes(): Promise<void> {
        this.emotesByChannel.set(-1, {
            ffzEmotes: await this.#fetchFFZEmotes(),
            bttvEmotes: await this.#fetchBTTVEmotes(),
            sevenTvEmotes: await this.#fetchSevenTVEmotes(),
            twitchEmotes: await this.#fetchTwitchEmotes(),
        });
    }

    async #fetchFFZEmotes(channelId?: number): Promise<CollectionType<string, FFZEmote>> {
        try {
            return await this.fetcher.fetchFFZEmotes(channelId);
        } catch {
            return new Collection();
        }
    }

    async #fetchBTTVEmotes(channelId?: number): Promise<CollectionType<string, BTTVEmote>> {
        try {
            return await this.fetcher.fetchBTTVEmotes(channelId);
        } catch {
            return new Collection();
        }
    }

    async #fetchSevenTVEmotes(channelId?: number): Promise<CollectionType<string, SevenTVEmote>> {
        try {
            return await this.fetcher.fetchSevenTVEmotes(channelId);
        } catch {
            return new Collection();
        }
    }

    async #fetchTwitchEmotes(channelId?: number): Promise<CollectionType<string, TwitchEmote>> {
        try {
            return await this.fetcher.fetchTwitchEmotes(channelId);
        } catch {
            return new Collection();
        }
    }

    async fetchEmotesForChannel(channelId: number): Promise<void> {
        if (this.emotesByChannel.has(channelId)) {
            return;
        }
        const promises = [
            this.#fetchFFZEmotes(channelId),
            this.#fetchBTTVEmotes(channelId),
            this.#fetchSevenTVEmotes(channelId),
            this.#fetchTwitchEmotes(channelId),
        ];
        const emotes = await Promise.all(promises);
        this.emotesByChannel.set(channelId, {
            ffzEmotes: emotes[0] as CollectionType<string, FFZEmote>,
            bttvEmotes: emotes[1] as CollectionType<string, BTTVEmote>,
            sevenTvEmotes: emotes[2] as CollectionType<string, SevenTVEmote>,
            twitchEmotes: emotes[3] as CollectionType<string, TwitchEmote>,
        });
    }

    getEmote(emoteName: string, channelId: number): ChannelEmote | undefined {
        if (!this.emotesByChannel.has(channelId)) {
            console.error(`Could not fetch an emote for a channel (${channelId}) which has not yet been fetched`);
            return;
        }

        const channelEmotes = this.emotesByChannel.get(channelId)!;
        if (channelEmotes.sevenTvEmotes.has(emoteName)) {
            return channelEmotes.sevenTvEmotes.get(emoteName);
        }
        if (channelEmotes.bttvEmotes.has(emoteName)) {
            return channelEmotes.bttvEmotes.get(emoteName);
        }
        if (channelEmotes.ffzEmotes.has(emoteName)) {
            return channelEmotes.ffzEmotes.get(emoteName);
        }
        if (channelEmotes.twitchEmotes.has(emoteName)) {
            return channelEmotes.twitchEmotes.get(emoteName);
        }

        if (channelId === -1) {
            return;
        }
        this.#assertGlobalEmotesPresent();
        return this.getEmote(emoteName, -1);
    }

    #assertGlobalEmotesPresent(): void {
        const globalEmotes = this.emotesByChannel.get(-1);
        if (!globalEmotes) {
            throw new Error("FATAL: Global emotes not found");
        }
    }

    mapToEmote(emoteName: string, channelId: number, size: number = 1): string | EmoteLink {
        const channelEmote = this.getEmote(emoteName.trim(), channelId);
        if (channelEmote?.toLink(size)) {
            return {
                href: channelEmote.toLink(size),
                name: emoteName,
            };
        }
        return emoteName;
    }

    parseChat(chat: string, channelId: number): (string | EmoteLink)[] {
        return chat.split(" ").map((token) => this.mapToEmote(token, channelId));
    }
}

export const emoteFetcherService = new EmoteFetcherService();
