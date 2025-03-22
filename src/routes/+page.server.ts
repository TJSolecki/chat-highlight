import twitchEmoticons from "@mkody/twitch-emoticons";
const { EmoteFetcher } = twitchEmoticons;

const fetcher = new EmoteFetcher();
const emotes = await fetcher.fetchSevenTVEmotes(503012119, "avif");

export const load = async () => {
    // First fetch some emotes
    return { duckSmokeLink: emotes.get("classic")?.toLink(1) };
};
