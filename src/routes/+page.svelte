<script lang="ts">
  import { onMount } from 'svelte';
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
    InlineLoading,
    Modal,
    Theme,
    Toggle
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
  let isDarkMode = false;

  onMount(() => {
    if (browser) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      isDarkMode = prefersDark;
    }
  });

  $: theme = isDarkMode ? 'g100' : 'white';

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
          console.error(`Error fixing font ${file.name}:`, error);
          errorMessages[file.name] = `An error occurred while processing the font: ${error.message}`;
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

<svelte:head>
  <title>Font Metrics Fixer - Fix Vertical Metrics for Cross-Platform Consistency</title>
  <meta name="description" content="Automatically fix font vertical metrics for consistent rendering across iOS, macOS, Windows, Android, and Firefox. Upload, fix, and download perfectly adjusted fonts.">
  <meta name="keywords" content="font metrics, vertical metrics, font fixing, cross-platform fonts, iOS fonts, macOS fonts, Windows fonts, Android fonts, Firefox fonts, font consistency, typography, web fonts, font rendering, ascent, descent, line gap, font tools">
</svelte:head>

<Theme bind:theme>
<Content>
  <Grid>
    <Row>
      <Column>
        <h1>Font Metrics Fixer</h1>
        <p>Fix vertical metrics for consistent rendering across all platforms</p>
      </Column>
    </Row>
    <Row>
      <Column>
        <Toggle 
          labelText="Dark mode" 
          bind:toggled={isDarkMode}
        />
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
          <InlineLoading description="Processing files..." />
        </Column>
      </Row>
    {/if}
    {#if Object.keys(fixedFonts).length > 0}
      <Row>
        <Column>
          <Button icon={Download} on:click={handleDownloadAll}>Download all fixed fonts (ZIP)</Button>
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
                  iconDescription="Show metrics"
                  on:click={() => showMetrics(filename)}
                />
                <Button 
                  kind="ghost" 
                  icon={Download} 
                  iconDescription="Download font"
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
</Theme>

<Modal
  open={showMetricsModal}
  modalHeading="Font Metrics"
  primaryButtonText="Close"
  on:close={() => showMetricsModal = false}
  on:submit={() => showMetricsModal = false}
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
  h1 {
    margin-bottom: 0.5rem;
  }

  p {
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