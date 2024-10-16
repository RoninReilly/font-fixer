<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import FileUpload from '$lib/FileUpload.svelte';
  import { fixFontMetrics } from '$lib/fontFixer';
  import { getMetrics } from '$lib/utils';
  import opentype from 'opentype.js';
  import JSZip from 'jszip';
  import { 
    Content, 
    Grid, 
    Row, 
    Column, 
    Button,
    InlineLoading,
    Theme,
    Header,
    HeaderUtilities,
    HeaderGlobalAction,
    SkipToContent,
    Tabs,
    Tab,
    TabContent
  } from "carbon-components-svelte";
  import Download from "carbon-icons-svelte/lib/Download.svelte";
  import LogoGithub from "carbon-icons-svelte/lib/LogoGithub.svelte";
  import Light from "carbon-icons-svelte/lib/Light.svelte";
  import Asleep from "carbon-icons-svelte/lib/Asleep.svelte";
  import AboutMetrics from '$lib/AboutMetrics.svelte';
  import MetricsModal from '$lib/MetricsModal.svelte';
  import FontItem from '$lib/FontItem.svelte';
  import { inject } from '@vercel/analytics';

  let fixedFonts: { [filename: string]: ArrayBuffer } = {};
  let originalMetrics: { [filename: string]: any } = {};
  let fixedMetrics: { [filename: string]: any } = {};
  let errorMessages: { [filename: string]: string } = {};
  let isProcessing = false;
  let showMetricsModal = false;
  let currentMetrics: { original: any, fixed: any } | null = null;
  let isDarkMode = false;
  let selectedTab = 0;
  let theme: 'white' | 'g100' = 'white';

  onMount(() => {
    if (browser) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      isDarkMode = prefersDark;
      theme = isDarkMode ? 'g100' : 'white';
    }
  });

  $: {
    theme = isDarkMode ? 'g100' : 'white';
  }

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

          const fixedFontBuffer = await fixFontMetrics(arrayBuffer);
          fixedFonts[file.name] = fixedFontBuffer;
          console.log('Font fixed');
          
          const fixedFontParsed = opentype.parse(fixedFontBuffer);
          fixedMetrics[file.name] = getMetrics(fixedFontParsed);
          console.log('Fixed metrics:', fixedMetrics[file.name]);

          errorMessages[file.name] = '';
        } catch (error) {
          console.error(`Error fixing font ${file.name}:`, error);
          errorMessages[file.name] = `An error occurred while processing the font: ${(error as Error).message}`;
        }
      }
      fixedFonts = fixedFonts;
      originalMetrics = originalMetrics;
      fixedMetrics = fixedMetrics;
      errorMessages = errorMessages;
      isProcessing = false;
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
  <Header platformName="Font Metrics Fixer">
    <svelte:fragment slot="skip-to-content">
      <SkipToContent />
    </svelte:fragment>
    <HeaderUtilities>
      <HeaderGlobalAction 
        aria-label="GitHub Repository"
        icon={LogoGithub}
        href="https://github.com/RoninReilly/font-fixer"
        target="_blank"
        rel="noopener noreferrer"
      />
      <HeaderGlobalAction 
        aria-label="Toggle dark mode" 
        icon={isDarkMode ? Light : Asleep} 
        on:click={() => isDarkMode = !isDarkMode}
      />
    </HeaderUtilities>
  </Header>

  <Content>
    <Tabs bind:selected={selectedTab}>
      <Tab label="Font Converter" />
      <Tab label="Font Metrics Fixer" />
      <svelte:fragment slot="content">
        <TabContent>
          {#if selectedTab === 0}
            <Grid>
              <Row>
                <Column>
                  <h1>Font Converter</h1>
                  <p>Convert your fonts to different formats</p>
                  <!-- Add font converter functionality here -->
                </Column>
              </Row>
            </Grid>
          {:else if selectedTab === 1}
            <Grid>
              <Row>
                <Column>
                  <h1>Font Metrics Fixer</h1>
                  <p>Fix vertical metrics for consistent rendering across all platforms</p>
                </Column>
              </Row>
              <Row>
                <Column>
                  <div class="upload-container">
                    <FileUpload onFilesUpload={handleFilesUpload} />
                  </div>
                </Column>
              </Row>
              {#if isProcessing}
                <Row>
                  <Column>
                    <div class="processing-container">
                      <InlineLoading description="Processing files..." />
                    </div>
                  </Column>
                </Row>
              {/if}
              {#if Object.keys(fixedFonts).length > 0}
                <Row>
                  <Column>
                    <div class="download-all-container">
                      <Button icon={Download} on:click={handleDownloadAll}>Download all fixed fonts (ZIP)</Button>
                    </div>
                  </Column>
                </Row>
              {/if}
              {#each Object.entries(fixedFonts) as [filename, _]}
                <Row>
                  <Column>
                    <FontItem
                      {filename}
                      errorMessage={errorMessages[filename]}
                      onShowMetrics={() => showMetrics(filename)}
                      onDownload={() => handleDownload(filename)}
                    />
                  </Column>
                </Row>
              {/each}
              <Row>
                <Column>
                  <AboutMetrics />
                </Column>
              </Row>
            </Grid>
          {/if}
        </TabContent>
      </svelte:fragment>
    </Tabs>
  </Content>

  <footer>
    <p>
      Created by <a href="https://phlora.ru" target="_blank" rel="noopener noreferrer">phlora.ru</a> | 
      Contact: <a href="https://t.me/roninreilly" target="_blank" rel="noopener noreferrer">t.me/roninreilly</a> | 
      <a href="https://github.com/RoninReilly/font-fixer" target="_blank" rel="noopener noreferrer">GitHub Repository</a>
    </p>
  </footer>
</Theme>

<MetricsModal bind:showModal={showMetricsModal} {currentMetrics} />

<style>
  @import './styles.css';
</style>
