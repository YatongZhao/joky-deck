import { saveAs } from 'file-saver';
import { Button, Group } from '@mantine/core';
import { useGearProjectStore } from './store';

export const ReactionPanel = ({ svgRef }: { svgRef: React.RefObject<SVGSVGElement> }) => {
  const gearProject = useGearProjectStore((state) => state.gearProject);

  const handleExportProject = () => {
    const gearProjectJson = JSON.stringify(gearProject);
    saveAs(new Blob([gearProjectJson], { type: 'application/json' }), 'gear-project.json');
  }

  const handleExportSVG = () => {
    const svgData = svgRef.current?.outerHTML;
    if (!svgData) return;
    saveAs(new Blob([svgData], { type: 'image/svg+xml' }), 'gear-project.svg');
  }
  return <Group pos="fixed" justify="center" bottom={0} left={0} right={0} p="md" style={{ zIndex: 1000 }}>
    <Button onClick={handleExportProject}>Export Gear Project</Button>
    <Button onClick={handleExportSVG}>Export SVG</Button>
  </Group>;
}
