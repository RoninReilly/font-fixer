<script lang="ts">
  import { browser } from '$app/environment';
  import { FileUploaderDropContainer } from "carbon-components-svelte";

  export let onFilesUpload: (files: File[]) => void;

  function handleFilesSelect(e: CustomEvent<File[]>) {
    const files = e.detail;
    if (files.length > 0) {
      onFilesUpload(files);
    }
  }
</script>

{#if browser}
  <FileUploaderDropContainer
    labelText="Перетащи сюда файлы шрифтов или кликни для выбора"
    accept={['.ttf', '.otf']}
    multiple
    on:change={handleFilesSelect}
  />
{:else}
  <p>Загрузка компонента...</p>
{/if}