import { saveAs } from 'file-saver';
import { Button, Group } from '@mantine/core';
import { getGearProjectSnapshot, viewBoxA$, viewBoxB$ } from './store';
import { vec2 } from 'gl-matrix';
import { UndoRedoController } from './UndoRedoController';

export const ReactionPanel = ({ svgRef }: { svgRef: React.RefObject<SVGSVGElement> }) => {
  const handleExportProject = () => {
    const gearProjectJson = JSON.stringify(getGearProjectSnapshot());
    saveAs(new Blob([gearProjectJson], { type: 'application/json' }), 'gear-project.json');
  }

  // TODO: Not correct
  const handleExportSVG = () => {
    const svgData = (svgRef.current?.cloneNode(true) as SVGSVGElement);
    const viewBoxA = viewBoxA$.getValue();
    const viewBoxB = viewBoxB$.getValue();
    svgData.setAttribute('viewBox', viewBoxA.join(' ') + ' ' + vec2.sub(vec2.create(), viewBoxB, viewBoxA).join(' '));
    svgData.setAttribute('width', '');
    svgData.setAttribute('height', '');
    if (!svgData) return;
    saveAs(new Blob([svgData.outerHTML], { type: 'image/svg+xml' }), 'gear-project.svg');
  }
  return <Group pos="fixed" justify="center" bottom={0} left={0} right={0} p="md" style={{ zIndex: 1000 }}>
    <UndoRedoController />
    <Button onClick={handleExportProject}>Export Gear Project</Button>
    <Button onClick={handleExportSVG}>Export SVG</Button>
  </Group>;
}
