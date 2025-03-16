<script lang="ts">
	import { fly } from 'svelte/transition';
	let open = $state(true);

	$effect(() => {
		const listener = () => {
			open = localStorage.getItem('open') === 'true';
		};
		window.addEventListener('storage', listener);
		return () => {
			removeEventListener('storage', listener);
		};
	});

	function openPopup() {
		window.open('/chat', '_blank');
	}

	function setOpen(value: boolean): void {
		open = value;
		localStorage.setItem('open', String(value));
	}
</script>

<button class="border p-2 hover:cursor-pointer" onclick={openPopup}>open popup</button>
<button class="border p-2 hover:cursor-pointer" onclick={() => setOpen(!open)}>toggle open</button>

{#if open}
	<div
		class="fixed right-8 bottom-8 w-sm bg-slate-800 p-4"
		transition:fly={{ x: 200, duration: 500 }}
	>
		<span class="text-green-500">based_chatter</span>
		<span class="text-white">
			glizzy hands glizzy hands glizzy hands glizzy hands glizzy hands glizzy hands glizzy hands
			glizzy hands glizzy hands glizzy hands glizzy hands glizzy hands
		</span>
	</div>
{/if}
