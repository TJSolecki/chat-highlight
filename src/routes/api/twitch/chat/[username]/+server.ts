import { getAccessToken } from "$lib/server/twitch";
import { twitchService } from "$lib/server/twitch-service";
import { emoteFetcherService } from "$lib/fetcher";

export async function GET({ params }: { params: { username: string } }) {
    const accessToken = await getAccessToken();
    const users = await twitchService.getUsers(params.username, { accessToken });
    if (!users.length) {
        return new Response("No Twitch channel exists for a user with the name: " + params.username, { status: 404 });
    }
    const userId = users[0].id;
    await emoteFetcherService.fetchEmotesForChannel(userId);
    twitchService.getChannelBadges(userId);
    const ws = new WebSocket("wss://irc-ws.chat.twitch.tv:443");
    const stream = new ReadableStream({
        start(controller) {
            connectToChat(params.username, ws, accessToken, controller, userId);
        },
        cancel() {
            ws.close();
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        },
    });
}

function connectToChat(
    username: string,
    ws: WebSocket,
    accessToken: string,
    controller: ReadableStreamDefaultController,
    userId: number,
) {
    ws.addEventListener("open", () => {
        ws.send("CAP REQ :twitch.tv/commands twitch.tv/tags"); // Request commands and tags
        ws.send(`PASS oauth:${accessToken}`); // Authenticate (replace with your token)
        ws.send(`NICK justinfan${Math.floor(Math.random() * 99999)}`); // Use a "justinfan" nickname (anonymous)
        ws.send(`JOIN #${username}`); // Join the channel
    });

    ws.addEventListener("message", (event) => {
        const message = event.data;

        if (message.startsWith("PING")) {
            ws.send("PONG :tmi.twitch.tv"); // Respond to PING messages
            return;
        }

        // Parse chat messages
        if (message.includes("PRIVMSG")) {
            const parts = message.split(" :");
            const metadata = parseMetadata(parts[0]);
            const chat = emoteFetcherService.parseChat(parts[2], userId);
            const userInfo = parts[1].split("!");
            const username = userInfo[0].substring(userInfo[0].lastIndexOf(":") + 1);
            const id = crypto.randomUUID();
            const badges =
                metadata?.badges
                    ?.split(",")
                    ?.map((badge) => twitchService.parseBadge(badge, userId))
                    ?.filter((badge) => badge !== undefined) ?? [];

            try {
                controller.enqueue(
                    `event: chat\ndata: ${JSON.stringify({ id, username, chat, ...metadata, badges })}\n\n`,
                );
            } catch {
                closeController(controller);
                ws.close();
            }
        }
    });

    ws.addEventListener("close", () => {
        closeController(controller);
        ws.close();
    });

    ws.addEventListener("error", (error) => {
        controller.error(error);
        ws.close();
    });
}

function parseMetadata(metadata: string): Record<string, string> {
    const entries = metadata
        .split(";")
        .map((keyValue) => [keyValue.slice(0, keyValue.indexOf("=")), keyValue.slice(keyValue.indexOf("=") + 1)])
        .filter(([_, value]) => value.length);
    return Object.fromEntries(entries);
}

function closeController(controller: ReadableStreamDefaultController) {
    try {
        controller.close();
    } catch {
        // ignore
    }
}
