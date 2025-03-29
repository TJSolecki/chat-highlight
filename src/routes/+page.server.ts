import { emoteFetcherService, type EmoteLink } from "$lib/fetcher";
await emoteFetcherService.fetchEmotesForChannel(503012119);
const duckSmokeLink = (emoteFetcherService.mapToEmote("classic", 503012119) as EmoteLink).href;

export const load = async () => {
    return { duckSmokeLink };
};
