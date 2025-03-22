<script lang="ts" module>
    export type Chat = { id: string; username: string; chat: string; color: string };
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
    type Props = {
        /** The username of the twitch streamer you want to see the live chat for. */
        data: { username: string };
    };
    const { data }: Props = $props();
    let chats = $state<Chat[]>([]);
    let autoScroll = $state(true);

    $effect(() => {
        const eventSource = new EventSource(`/api/twitch/chat/${data.username}`);
        function handleMessage(event: MessageEvent) {
            const chat: Chat = JSON.parse(event.data);
            chats.push(chat);
            if (autoScroll) {
                window.scrollTo(0, document.body.scrollHeight);
            }
        }
        eventSource.addEventListener("chat", handleMessage);

        document.addEventListener("scroll", () => {
            const lastScrollPosition = window.scrollY;
            console.log(window.scrollY, document.body.scrollHeight);
            autoScroll =
                lastScrollPosition <= document.body.scrollHeight + 5 ||
                lastScrollPosition >= document.body.scrollHeight + 5;
        });
        return () => {
            eventSource.close();
        };
    });

    function setActiveChat(chat: Chat) {
        localStorage.removeItem("highlightedChat");
        localStorage.setItem("highlightedChat", JSON.stringify(chat));
    }
</script>

<div class="min-h-screen bg-zinc-900">
    <h1
        class="sticky top-0 z-10 flex justify-center border-b border-zinc-800 bg-zinc-900 py-4 text-xs font-bold text-white"
    >
        {data.username.toUpperCase()}'S STREAM CHAT
    </h1>
    <ol class="flex flex-col">
        {#each chats as chat (chat.id)}
            <li
                onclick={() => setActiveChat(chat)}
                id={chat.id}
                class="px-4 py-2 text-[0.825rem] font-semibold text-white hover:bg-zinc-800"
            >
                <span style="color: {getColor(chat)}">{chat.username}</span>: {chat.chat}
            </li>
        {/each}
    </ol>
</div>
