<script lang="ts">
  import { Modal } from "carbon-components-svelte";

  export let showModal: boolean;
  export let currentMetrics: { original: any; fixed: any } | null;

  function closeModal() {
    showModal = false;
  }
</script>

<Modal
  bind:open={showModal}
  modalHeading="Font Metrics"
  primaryButtonText="Close"
  on:close={closeModal}
  on:submit={closeModal}
>
  {#if currentMetrics}
    <div class="metrics-comparison">
      <div>
        <h3>Original Metrics</h3>
        <pre>{JSON.stringify(currentMetrics.original, null, 2)}</pre>
      </div>
      <div>
        <h3>Fixed Metrics</h3>
        <pre>{JSON.stringify(currentMetrics.fixed, null, 2)}</pre>
      </div>
    </div>
  {/if}
</Modal>

<style>
  .metrics-comparison {
    display: flex;
    justify-content: space-between;
  }

  .metrics-comparison > div {
    width: 48%;
  }

  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
  }
</style>
