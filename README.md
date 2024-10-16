# Font Metrics Fixer

Fix font vertical metrics across all platforms - iOS, macOS, Windows, Android, and Firefox.

## 🚀 Features

- Automatically adjusts Ascent, Descent, LineGap, and other crucial metrics
- Supports multiple font uploads (TTF, OTF)
- Instant preview of original vs. fixed metrics
- Download individual fixed fonts or all as a ZIP
- Ensures consistent font appearance across different operating systems and browsers

## 🎯 Why Use Font Metrics Fixer?

Inconsistent font metrics can lead to layout issues, varying line heights, and inconsistent text rendering across different platforms. This tool solves these problems by:

- Aligning vertical metrics (OS/2, hhea, head tables)
- Setting appropriate values for usWinAscent and usWinDescent
- Ensuring consistent line spacing across all major platforms

## 📏 Understanding Vertical Metrics

Vertical metrics determine the baseline in a text and the space between lines of text. There are three pairs of ascender/descender values: hhea, OS/2, and usWin metrics. Different sets are used depending on the font, operating system, and application.

- **Mac**: Safari and Chrome use the hhea values to render text. Firefox respects the useTypoMetrics setting and uses the OS/2 values if set; otherwise, it uses hhea metrics.

- **Windows**: All browsers use the usWin metrics but respect the useTypoMetrics setting, using OS/2 values if set.

## 🛠 How It Works

1. Upload your font file(s)
2. Our algorithm analyzes and adjusts the following metrics:
   - OS/2: typoAscender, typoDescender, typoLineGap, usWinAscent, usWinDescent
   - hhea: ascender, descender, lineGap
   - head: yMax, yMin
3. Preview the changes
4. Download your fixed font(s)

## 🚀 Getting Started

Visit [Font Metrics Fixer](https://fonts-fixer.vercel.app) to start fixing your fonts now!

## 🤓 For Developers

To run this project locally:

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

Keywords: font metrics, vertical metrics, font fixing, cross-platform fonts, iOS fonts, macOS fonts, Windows fonts, Android fonts, Firefox fonts, font consistency, typography, web fonts, font rendering, ascent, descent, line gap, font tools
