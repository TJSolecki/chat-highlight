<script lang="ts" module>
    export const OUT_DURATION_MS = 500;
    import swoosh from "../../assets/swoosh.mp3";
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
    <div class="fixed right-8 bottom-8 max-w-sm bg-zinc-900 p-4" transition:fly={{ x: 200, duration: 500 }}>
        <div id={chat.id} class="text-[0.825rem] font-semibold text-white">
            <span class="inline-flex max-w-full flex-wrap items-center gap-1">
                <span><span style="color: {getColor(chat)}">{chat.username}</span>:</span>
                {#each chat.chat as token, i (i)}
                    {#if typeof token === "string"}
                        <span>{token}</span>
                    {:else}
                        <img class="h-6" alt={token.name} src={token.href} />
                    {/if}
                {/each}
            </span>
        </div>
    </div>
{/if}
