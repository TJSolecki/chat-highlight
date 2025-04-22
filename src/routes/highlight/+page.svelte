<script lang="ts" module>
    export const OUT_DURATION_MS = 500;
    import swoosh from "../../assets/swoosh.mp3";
</script>

<script lang="ts">
    import { fly } from "svelte/transition";
    import type { ChatData } from "../chat/[username]/+page.svelte";
    import Chat from "$lib/components/chat.svelte";

    let chat = $state<ChatData>();

    $effect(() => {
        const listener = () => {
            const chatJson = localStorage.getItem("highlightedChat");
            if (chatJson) {
                chat = JSON.parse(chatJson);
                new Audio(swoosh).play();
            } else {
                chat = undefined;
            }
        };
        window.addEventListener("storage", listener);
        return () => {
            removeEventListener("storage", listener);
        };
    });
</script>

{#if chat}
    <div class="fixed right-8 bottom-8 max-w-sm rounded bg-zinc-900 p-4" transition:fly={{ x: 200, duration: 500 }}>
        <Chat {chat} />
    </div>
{/if}
