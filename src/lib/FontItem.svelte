<script lang="ts">
  import { Tile, Button } from "carbon-components-svelte";
  import Information from "carbon-icons-svelte/lib/Information.svelte";
  import Download from "carbon-icons-svelte/lib/Download.svelte";

  export let filename: string;
  export let errorMessage: string = "";
  export let onShowMetrics: () => void;
  export let onDownload: () => void;
</script>

<div class="font-item-container">
  <Tile>
    <div class="font-item">
      <span>{filename}</span>
      <div>
        <Button 
          kind="ghost" 
          icon={Information} 
          iconDescription="Show metrics"
          on:click={onShowMetrics}
        />
        <Button 
          kind="ghost" 
          icon={Download} 
          iconDescription="Download font"
          on:click={onDownload}
        />
      </div>
    </div>
    {#if errorMessage}
      <div class="error">{errorMessage}</div>
    {/if}
  </Tile>
</div>

<style>
  .font-item-container {
    margin-bottom: 1rem;
  }

  .font-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .error {
    color: #da1e28;
    margin-top: 1rem;
  }
</style>
