<script lang="ts" module>
    export type Chat = { id: string; username: string; chat: (string | EmoteLink)[]; color: string };
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

    export function getColor(chat: Chat) {
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

<script lang="ts">
    import { ExternalLink, Pause, Repeat2 } from "lucide-svelte/icons";
    import { chatState } from "$lib/chat-state.svelte";
    import { fade } from "svelte/transition";
    import type { EmoteLink } from "$lib/fetcher";
    type Props = {
        /** The username of the twitch streamer you want to see the live chat for. */
        data: { username: string };
    };
    const { data }: Props = $props();
    let chats = $state<Chat[]>([]);
    let autoScroll = $state(true);
    let lastScrollY = $state(0);

    $effect(() => {
        const eventSource = new EventSource(`/api/twitch/chat/${data.username}`);
        function handleMessage(event: MessageEvent) {
            const chat: Chat = JSON.parse(event.data);
            chats.push(chat);
            if (autoScroll) {
                setTimeout(() => scrollToBottomOfChat(), 0);
            }
        }
        eventSource.addEventListener("chat", handleMessage);

        return () => {
            eventSource.close();
        };
    });

    $effect(() => {
        function toggleAutoScroll(): void {
            if (isScrolledToBottomOfChat()) {
                autoScroll = true;
            } else if (window.scrollY < lastScrollY) {
                autoScroll = false;
            }
            lastScrollY = Math.max(0, window.scrollY);
        }
        window.addEventListener("scroll", toggleAutoScroll);
        return () => {
            window.removeEventListener("scroll", toggleAutoScroll);
        };
    });

    function scrollToBottomOfChat() {
        window.scrollTo(0, document.body.scrollHeight);
    }

    function isScrolledToBottomOfChat(): boolean {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const buffer = 1;
        return window.scrollY + windowHeight >= documentHeight - buffer;
    }

    function setActiveChat(chat: Chat): void {
        chatState.highlightChat(chat);
    }
</script>

<div class="min-h-screen bg-zinc-900">
    <div class="sticky top-0 z-10 flex h-12 justify-center border-b border-zinc-800 bg-zinc-900 py-4">
        <h1 class="text-xs font-bold text-white">{data.username.toUpperCase()}'S STREAM CHAT</h1>
        <div class="absolute top-0 flex h-12 w-full items-center justify-between px-[6px]">
            <button
                onclick={() => chatState.replayLastChat()}
                class="rounded p-2 text-white hover:cursor-pointer hover:bg-zinc-800"><Repeat2 /></button
            >
            <button
                onclick={() => {
                    window.open("/highlight", "Chroma-key me to see highlighted chats", "width=800,height=800");
                }}
                class="rounded p-2 text-white hover:cursor-pointer hover:bg-zinc-800"><ExternalLink /></button
            >
        </div>
    </div>
    <ol class="flex flex-col">
        {#each chats as chat (chat.id)}
            <button
                onclick={() => setActiveChat(chat)}
                id={chat.id}
                class="w-full px-4 py-1 text-left text-[0.825rem] font-semibold text-white hover:bg-zinc-800"
            >
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
            </button>
        {/each}
    </ol>
    {#if !autoScroll}
        <button
            transition:fade={{ duration: 100 }}
            class="fixed bottom-4 left-1/2 flex -translate-x-1/2 transform items-center gap-2 rounded-md
            border-3 border-zinc-800 bg-zinc-900/80 p-2 text-[0.825rem] text-white backdrop-blur-xs
            hover:cursor-pointer"
            onclick={scrollToBottomOfChat}
        >
            <Pause /> Chat paused
        </button>
    {/if}
</div>
