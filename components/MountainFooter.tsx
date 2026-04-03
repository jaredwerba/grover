// Spacer that reveals the fixed ski map behind the page content on scroll
// Transparent spacer — sized to match footer.jpg aspect ratio (428/1020)
// so the full image is revealed as content scrolls away
export default function MountainFooter() {
  return <div style={{ height: "42vw", flexShrink: 0 }} />;
}
