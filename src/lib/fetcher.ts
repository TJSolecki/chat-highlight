import twitchEmoticons, { BTTVEmote, Collection, FFZEmote, SevenTVEmote, TwitchEmote } from "@mkody/twitch-emoticons";
import { CLIENT_ID, CLIENT_SECRET } from "$env/static/private";
const { EmoteFetcher } = twitchEmoticons;

type ChannelEmotes = {
    ffzEmotes: Collection<string, FFZEmote>;
    bttvEmotes: Collection<string, BTTVEmote>;
    sevenTvEmotes: Collection<string, SevenTVEmote>;
    twitchEmotes: Collection<string, TwitchEmote>;
};

export type ChannelEmote = FFZEmote | BTTVEmote | SevenTVEmote | TwitchEmote;

export type EmoteLink = {
    href: string;
};

class EmoteFetcherService {
    fetcher = new EmoteFetcher(CLIENT_ID, CLIENT_SECRET);
    emotesByChannel = new Map<number, ChannelEmotes>();
    constructor() {
        this.fetcher.fetchSevenTVEmotes(undefined, "avif");
    }

    async fetchEmotesForChannel(channelId: number): Promise<void> {
        if (this.emotesByChannel.has(channelId)) {
            return;
        }
        const promises = [
            this.fetcher.fetchFFZEmotes(channelId),
            this.fetcher.fetchBTTVEmotes(channelId),
            this.fetcher.fetchSevenTVEmotes(channelId),
            this.fetcher.fetchTwitchEmotes(channelId),
        ];
        const emotes = await Promise.all(promises);
        this.emotesByChannel.set(channelId, {
            ffzEmotes: emotes[0] as Collection<string, FFZEmote>,
            bttvEmotes: emotes[1] as Collection<string, BTTVEmote>,
            sevenTvEmotes: emotes[2] as Collection<string, SevenTVEmote>,
            twitchEmotes: emotes[3] as Collection<string, TwitchEmote>,
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
    }

    mapToEmote(emoteName: string, channelId: number, size: number = 1): string | EmoteLink {
        const channelEmote = this.getEmote(emoteName, channelId);
        if (channelEmote?.toLink(size)) {
            return {
                href: channelEmote.toLink(size),
            };
        }
        return emoteName;
    }
}

export const emoteFetcherService = new EmoteFetcherService();
