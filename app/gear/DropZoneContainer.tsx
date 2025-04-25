import { Box, Text } from "@mantine/core"
import { useDropzone } from "react-dropzone"

export const DropZoneContainer = <T,>({ children, onJsonLoad, title }: { children?: React.ReactNode, onJsonLoad?: (json: T) => void, title?: string }) => {
  const handleDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const json = JSON.parse(event.target?.result as string);
      onJsonLoad?.(json);
    }
    reader.readAsText(file);
  }
  const { getRootProps, getInputProps } = useDropzone({
    noClick: true,
    noKeyboard: true,
    accept: {
      'application/json': ['.json'], // Accept JSON files
    },
    onDrop: handleDrop,
  });
  return (
    <Box {...getRootProps()}>
      <input {...getInputProps()} />
      { title && <Text pos="fixed" top="50%" left="50%" style={{ transform: 'translate(-50%, -50%)' }} fz="lg" c="dark.1">{title}</Text> }
      {children}
    </Box>
  )
}
