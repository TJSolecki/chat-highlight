<script lang="ts">
    import type { ChatData } from "../../routes/chat/[username]/+page.svelte";

    const COLORS = [
        "#0000FF",
        "#FF0000",
        "#8A2BE2",
        "#FF69B4",
        "#1E90FF",
        "#008000",
        "#00FF7F",
        "#B22222",
        "#DAA520",
        "#FF4500",
        "#2E8B57",
        "#5F9EA0",
        "#D2691E",
    ] as const;

    type Props = {
        /** Metadata for the chat displayed */
        chat: ChatData;
    };
    const { chat }: Props = $props();

    export function getColor(chat: ChatData) {
        if (chat.color) {
            return chat.color;
        }
        return COLORS[stringToHash(chat.username) % COLORS.length];
    }

    function stringToHash(str: string) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }
</script>

<span class="inline-flex max-w-full flex-wrap items-center gap-1 text-[0.825rem] font-semibold text-white">
    {#each chat.badges as badge, i (i)}
        <img src={badge.image_url_1x} alt={badge.title} />
    {/each}
    <span><span style="color: {getColor(chat)}">{chat["display-name"]}</span>:</span>
    {#each chat.chat as token, i (i)}
        {#if typeof token === "string"}
            <span>{token}</span>
        {:else}
            <img class="h-6" alt={token.name} src={token.href} />
        {/if}
    {/each}
</span>
