import { useGearProjectStore } from "./store";
import { useTheme } from "@/app/theme";
export const ExportViewBoxController = () => {
  const theme = useTheme();
  const gearProject = useGearProjectStore((state) => state.gearProject);
  const viewBox = gearProject.viewBox;
  
  return (
    <path
      d={`M ${viewBox.left} ${viewBox.top} L ${viewBox.left + viewBox.width} ${viewBox.top} L ${viewBox.left + viewBox.width} ${viewBox.top + viewBox.height} L ${viewBox.left} ${viewBox.top + viewBox.height} Z`}
      stroke={theme.colors.gray[2]}
      strokeWidth="1"
      fill="none"
    />
  )
}
