"use client"
import { useTheme } from "@/app/theme";
import { Gear, GearGroupContainer } from "@/app/gear/Gear";
import { Box, MantineColorsTuple } from "@mantine/core";
import { useEffect, useState } from "react";
import { testGears } from "./core/types.";

const GearGroup: React.FC<{ colors: MantineColorsTuple }> = ({ colors }) => {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0
  });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Initial update
    updateDimensions();

    // Add resize listener
    window.addEventListener('resize', updateDimensions);

    // Cleanup
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Don't render until we have valid dimensions
  if (dimensions.width === 0 || dimensions.height === 0) {
    return null;
  }

  return (
    <Box 
      style={{ 
        width: '100vw', 
        height: '100vh', 
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0
      }}
    >
      <GearGroupContainer
        width={dimensions.width}
        height={dimensions.height}
        durationUnit={1}
        module={15}
        color={colors[1]}
        hoverColor={colors[4]}
        gears={testGears}
      >
        <g transform="translate(60, 160)">
          <Gear teeth={6} positionAngle={0}>
            <Gear teeth={6} positionAngle={10}>
              <Gear teeth={3} positionAngle={80}>
                <Gear teeth={4} positionAngle={30}>
                  <Gear teeth={5} positionAngle={0}>
                    <Gear teeth={12} positionAngle={0}>
                      <Gear teeth={34} positionAngle={30}></Gear>
                    </Gear>
                  </Gear>
                </Gear>
              </Gear>
            </Gear>
          </Gear>
        </g>
      </GearGroupContainer>
    </Box>
  )
}

export default function Home() {
  const theme = useTheme();
  return <GearGroup colors={theme.colors.gameMain} />;
}
