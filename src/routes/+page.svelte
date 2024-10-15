<script lang="ts">
  import { browser } from '$app/environment';
  import FileUpload from '$lib/FileUpload.svelte';
  import { fixFont } from '$lib/fontFixer';
  import opentype from 'opentype.js';
  import JSZip from 'jszip';
  import { 
    Content, 
    Grid, 
    Row, 
    Column, 
    Button,
    Tile,
    OverflowMenu,
    OverflowMenuItem,
    InlineLoading,
    Modal
  } from "carbon-components-svelte";
  import Download from "carbon-icons-svelte/lib/Download.svelte";
  import Information from "carbon-icons-svelte/lib/Information.svelte";

  let fixedFonts: { [filename: string]: ArrayBuffer } = {};
  let originalMetrics: { [filename: string]: any } = {};
  let fixedMetrics: { [filename: string]: any } = {};
  let errorMessages: { [filename: string]: string } = {};
  let isProcessing = false;
  let showMetricsModal = false;
  let currentMetrics: { original: any, fixed: any } | null = null;

  async function handleFilesUpload(files: File[]) {
    if (browser) {
      isProcessing = true;
      for (const file of files) {
        try {
          console.log('Processing file:', file.name);
          
          const arrayBuffer = await file.arrayBuffer();
          const originalFont = await opentype.parse(arrayBuffer);
          
          originalMetrics[file.name] = getMetrics(originalFont);
          console.log('Original metrics:', originalMetrics[file.name]);

          const fixedFontBuffer = await fixFont(file);
          fixedFonts[file.name] = fixedFontBuffer;
          console.log('Font fixed');
          
          const fixedFontParsed = opentype.parse(fixedFontBuffer);
          fixedMetrics[file.name] = getMetrics(fixedFontParsed);
          console.log('Fixed metrics:', fixedMetrics[file.name]);

          errorMessages[file.name] = null;
        } catch (error) {
          console.error(`Ошибка при исправлении шрифта ${file.name}:`, error);
          errorMessages[file.name] = `Произошла ошибка при обработке шрифта: ${error.message}`;
        }
      }
      fixedFonts = fixedFonts;
      originalMetrics = originalMetrics;
      fixedMetrics = fixedMetrics;
      errorMessages = errorMessages;
      isProcessing = false;
    }
  }

  function getMetrics(font: any) {
    try {
      return {
        unitsPerEm: font.unitsPerEm || 0,
        ascender: font.ascender || 0,
        descender: font.descender || 0,
        lineGap: font.tables.hhea?.lineGap || 0,
        os2: {
          sTypoAscender: font.tables.os2?.sTypoAscender || 0,
          sTypoDescender: font.tables.os2?.sTypoDescender || 0,
          sTypoLineGap: font.tables.os2?.sTypoLineGap || 0,
          usWinAscent: font.tables.os2?.usWinAscent || 0,
          usWinDescent: font.tables.os2?.usWinDescent || 0,
        },
        hhea: {
          ascender: font.tables.hhea?.ascender || 0,
          descender: font.tables.hhea?.descender || 0,
          lineGap: font.tables.hhea?.lineGap || 0,
        },
        head: {
          yMax: font.tables.head?.yMax || 0,
          yMin: font.tables.head?.yMin || 0,
        }
      };
    } catch (error) {
      console.error('Error getting metrics:', error);
      return {
        unitsPerEm: 0, ascender: 0, descender: 0, lineGap: 0,
        os2: { sTypoAscender: 0, sTypoDescender: 0, sTypoLineGap: 0, usWinAscent: 0, usWinDescent: 0 },
        hhea: { ascender: 0, descender: 0, lineGap: 0 },
        head: { yMax: 0, yMin: 0 }
      };
    }
  }

  function handleDownload(filename: string) {
    if (fixedFonts[filename] && browser) {
      const blob = new Blob([fixedFonts[filename]], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  async function handleDownloadAll() {
    if (Object.keys(fixedFonts).length > 0 && browser) {
      const zip = new JSZip();
      for (const [filename, fontBuffer] of Object.entries(fixedFonts)) {
        zip.file(filename, fontBuffer);
      }
      const content = await zip.generateAsync({type: "blob"});
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = "fixed_fonts.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  function showMetrics(filename: string) {
    currentMetrics = {
      original: originalMetrics[filename],
      fixed: fixedMetrics[filename]
    };
    showMetricsModal = true;
  }
</script>

<Content>
  <Grid>
    <Row>
      <Column>
        <h1>Исправление метрик шрифта</h1>
      </Column>
    </Row>
    <Row>
      <Column>
        <FileUpload onFilesUpload={handleFilesUpload} />
      </Column>
    </Row>
    {#if isProcessing}
      <Row>
        <Column>
          <InlineLoading description="Обработка файлов..." />
        </Column>
      </Row>
    {/if}
    {#if Object.keys(fixedFonts).length > 0}
      <Row>
        <Column>
          <Button icon={Download} on:click={handleDownloadAll}>Скачать все исправленные шрифты (ZIP)</Button>
        </Column>
      </Row>
    {/if}
    {#each Object.entries(fixedFonts) as [filename, _]}
      <Row>
        <Column>
          <Tile>
            <div class="font-item">
              <span>{filename}</span>
              <div>
                <Button 
                  kind="ghost" 
                  icon={Information} 
                  iconDescription="Показать метрики"
                  on:click={() => showMetrics(filename)}
                />
                <Button 
                  kind="ghost" 
                  icon={Download} 
                  iconDescription="Скачать шрифт"
                  on:click={() => handleDownload(filename)}
                />
              </div>
            </div>
            {#if errorMessages[filename]}
              <div class="error">{errorMessages[filename]}</div>
            {/if}
          </Tile>
        </Column>
      </Row>
    {/each}
  </Grid>
</Content>

<Modal
  open={showMetricsModal}
  modalHeading="Метрики шрифта"
  primaryButtonText="Закрыть"
  on:close={() => showMetricsModal = false}
  on:submit={() => showMetricsModal = false}
>
  {#if currentMetrics}
    <div class="metrics-comparison">
      <div>
        <h3>Оригинальные метрики</h3>
        <pre>{JSON.stringify(currentMetrics.original, null, 2)}</pre>
      </div>
      <div>
        <h3>Исправленные метрики</h3>
        <pre>{JSON.stringify(currentMetrics.fixed, null, 2)}</pre>
      </div>
    </div>
  {/if}
</Modal>

<style>
  :global(body) {
    background-color: #f4f4f4;
  }
  
  h1 {
    margin-bottom: 2rem;
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