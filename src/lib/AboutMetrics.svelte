<script>
  import { Accordion, AccordionItem } from "carbon-components-svelte";
</script>

<div class="about-metrics">
  <h2>About Vertical Metrics</h2>
  <p>
    Vertical metrics determine the baseline in a text and the space between lines of text. For historical reasons, there are three pairs of ascender/descender values, known as hhea, OS/2 and usWin metrics. Depending on the font, operating system and application a different set will be used to render text on the screen.
  </p>
  
  <Accordion>
    <AccordionItem title="Mac">
      <p>On the Mac, Safari and Chrome use the hhea values to render text. Firefox will respect the useTypoMetrics setting and will use the OS/2 if it is set. If the useTypoMetrics is not set, Firefox will also use metrics from the hhea table.</p>
    </AccordionItem>
    
    <AccordionItem title="Windows">
      <p>On Windows, all browsers use the usWin metrics, but respect the useTypoMetrics setting and if set will use the OS/2 values.</p>
    </AccordionItem>
  </Accordion>
</div>

<style>
  .about-metrics {
    margin-top: 2rem;
    margin-bottom: 2rem;
  }

  h2 {
    margin-bottom: 1rem;
  }

  p {
    margin-bottom: 1rem;
  }
</style>
