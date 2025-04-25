import { saveAs } from 'file-saver';
import { Button } from '@mantine/core';
import { useGearProject } from './context';

export const ReactionPanel = ({ svgRef }: { svgRef: React.RefObject<SVGSVGElement> }) => {
  const { gearProject } = useGearProject();

  const handleExportProject = () => {
    const gearProjectJson = JSON.stringify(gearProject);
    saveAs(new Blob([gearProjectJson], { type: 'application/json' }), 'gear-project.json');
  }

  const handleExportSVG = () => {
    const svgData = svgRef.current?.outerHTML;
    if (!svgData) return;
    saveAs(new Blob([svgData], { type: 'image/svg+xml' }), 'gear-project.svg');
  }
  return <div>
    <Button onClick={handleExportProject}>Export Gear Project</Button>
    <Button onClick={handleExportSVG}>Export SVG</Button>
  </div>;
}
