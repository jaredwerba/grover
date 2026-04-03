// Spacer that reveals the fixed ski map behind the page content on scroll
// Transparent spacer — matches fixed footer height (image 42vw + text bar ~56px)
// so scrolling away reveals the full footer image beneath
export default function MountainFooter() {
  return <div style={{ height: "calc(42vw + 56px)", flexShrink: 0 }} />;
}
