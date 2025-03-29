import twitchEmoticons from "@mkody/twitch-emoticons";
const { EmoteFetcher } = twitchEmoticons;

export const fetcher = new EmoteFetcher();
fetcher.fetchSevenTVEmotes(undefined, "avif");
