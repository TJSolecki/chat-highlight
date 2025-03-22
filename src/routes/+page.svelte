<script lang="ts">
    import { fly, fade } from "svelte/transition";
    import { getColor, type Chat } from "./chat/[username]/+page.svelte";
    import swoosh from "../assets/swoosh.mp3";

    let chat = $state<Chat>();
    let timeout = $state<number>();
    const swooshAudio = new Audio(swoosh);

    $effect(() => {
        const listener = () => {
            const chatJson = localStorage.getItem("highlightedChat");
            if (chatJson) {
                swooshAudio.play();
                chat = JSON.parse(chatJson);
                if (timeout) {
                    clearTimeout(timeout);
                }
                timeout = setTimeout(() => (chat = undefined), 10_000);
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
    <div
        class="fixed right-8 bottom-8 max-w-sm bg-zinc-900 p-4"
        in:fly={{ x: 200, duration: 500 }}
        out:fade={{ duration: 200 }}
    >
        <div id={chat.id} class="text-[0.825rem] font-semibold text-white">
            <span style="color: {getColor(chat)}">{chat.username}</span>: {chat.chat}
        </div>
    </div>
{/if}
