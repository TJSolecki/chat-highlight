import { getAccessToken } from "$lib/server/twitch";

export async function GET({ params }: { params: { username: string } }) {
    const accessToken = await getAccessToken();
    const ws = new WebSocket("wss://irc-ws.chat.twitch.tv:443");
    const stream = new ReadableStream({
        start(controller) {
            connectToChat(params.username, ws, accessToken, controller);
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
) {
    ws.addEventListener("open", () => {
        console.log("Connected to Twitch Chat!");
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
            const chatMessage = parts[2];
            const userInfo = parts[1].split("!");
            const username = userInfo[0].substring(userInfo[0].lastIndexOf(":") + 1);

            try {
                controller.enqueue(`chat: ${username}: ${chatMessage}\n\n`);
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

function closeController(controller: ReadableStreamDefaultController) {
    try {
        controller.close();
    } catch {
        console.log("already closed");
    }
}
