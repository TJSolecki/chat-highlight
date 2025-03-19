<script lang="ts">
    function toggleOpen(): void {
        const open = localStorage.getItem("open") === "true";
        localStorage.setItem("open", String(!open));
    }
</script>

<button class="border p-2 hover:cursor-pointer" onclick={toggleOpen}>toggle open</button>
