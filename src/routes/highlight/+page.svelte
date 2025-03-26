<script lang="ts" module>
    export const OUT_DURATION_MS = 500;
</script>

<script lang="ts">
    import { fly } from "svelte/transition";
    import { getColor, type Chat } from "../chat/[username]/+page.svelte";

    let chat = $state<Chat>();

    $effect(() => {
        const listener = () => {
            const chatJson = localStorage.getItem("highlightedChat");
            if (chatJson) {
                chat = JSON.parse(chatJson);
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
    <div class="fixed right-8 bottom-8 max-w-sm bg-zinc-900 p-4" transition:fly={{ x: 200, duration: 500 }}>
        <div id={chat.id} class="text-[0.825rem] font-semibold text-white">
            <span style="color: {getColor(chat)}">{chat.username}</span>: {chat.chat}
        </div>
    </div>
{/if}
