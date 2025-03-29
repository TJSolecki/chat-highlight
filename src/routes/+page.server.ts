import { fetcher } from "$lib/fetcher";
const emotes = await fetcher.fetchSevenTVEmotes(503012119, "avif");

export const load = async () => {
    return { duckSmokeLink: emotes.get("classic")?.toLink(1) };
};
