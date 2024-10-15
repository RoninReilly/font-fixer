<script lang="ts">
  import { browser } from '$app/environment';
  import { FileUploaderDropContainer } from "carbon-components-svelte";

  export let onFilesUpload: (files: File[]) => void;

  function handleFilesSelect(e: CustomEvent<readonly File[]>) {
  const files = Array.from(e.detail); 
  if (files.length > 0) {
    onFilesUpload(files);
  }
}

</script>

{#if browser}
  <FileUploaderDropContainer
    labelText="Drag and drop the font files here or click to select"
    accept={['.ttf', '.otf']}
    multiple
    on:change={handleFilesSelect}
  />
{:else}
  <p>Loadding...</p>
{/if}