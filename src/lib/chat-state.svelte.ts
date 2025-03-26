import type { Chat } from "../routes/chat/[username]/+page.svelte";
import { OUT_DURATION_MS } from "../routes/highlight/+page.svelte";

export const HIGHLIGHTED_CHAT_KEY = "highlightedChat";
const CHAT_DURATION_MS = 15_000;

class ChatState {
    chat = $state<Chat>();
    timeout = $state<number>();

    constructor() {}

    highlightChat(chat: Chat) {
        if (this.timeout) {
            this.dismissCurrentChat();
            setTimeout(() => this.#addNewChat(chat), OUT_DURATION_MS);
        } else {
            this.#addNewChat(chat);
        }
    }

    #addNewChat(chat: Chat) {
        this.chat = chat;
        localStorage.setItem(HIGHLIGHTED_CHAT_KEY.toString(), JSON.stringify(chat));
        this.timeout = setTimeout(() => this.dismissCurrentChat(), CHAT_DURATION_MS);
    }

    dismissCurrentChat() {
        localStorage.removeItem(HIGHLIGHTED_CHAT_KEY.toString());
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = undefined;
    }

    replayLastChat() {
        if (this.chat) {
            this.#addNewChat(this.chat);
        }
    }
}

export const chatState = new ChatState();
