<script lang="ts">
    type Props = {
        data: {
            duckSmokeLink: string;
        };
    };
    const { data }: Props = $props();
    const duckSmokeLink = data.duckSmokeLink;
    let username = $state("");
</script>

<div class="mx-auto flex h-full min-h-screen justify-center bg-zinc-900 px-8">
    <form class="flex w-full max-w-2xl flex-col gap-4" method="GET" action="/chat/{username}">
        <div>
            <h1>
                Highlight your <span class="gap-2 text-purple-500">chatters.</span>
                <span class="inline-block">
                    <img alt="classic" src={duckSmokeLink} />
                </span>
            </h1>
        </div>
        <div class="flex items-center gap-2">
            <input
                type="text"
                bind:value={username}
                class="focus-visible:ring-ring font-sm h-10 w-full rounded-xl border-2 border-zinc-800
                p-2 text-white !ring-white ring-offset-zinc-900 transition-colors placeholder:text-sm
                placeholder:text-zinc-500 placeholder:italic focus-visible:ring-2 focus-visible:ring-white
                focus-visible:ring-offset-4 focus-visible:outline-none"
                placeholder="Enter your Twitch username..."
            />
            <button
                aria-label="open chat for creator"
                type="submit"
                class="focus-visible:ring-ring inline-flex h-10 items-center justify-center rounded-md bg-white px-4
                text-sm font-medium whitespace-nowrap text-black ring-white ring-offset-zinc-900 transition-colors
                hover:cursor-pointer hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-offset-2
                focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50">View chat</button
            >
        </div>
    </form>
</div>

<style>
    h1 {
        font-size: 4rem;
        color: #fff;
        text-align: center;
        font-weight: 300;
    }
</style>
