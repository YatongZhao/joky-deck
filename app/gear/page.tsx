"use client"
import { useTheme } from "@/app/theme";
import { Gear, GearGroupContainer } from "@/app/widgets/Gear";
import { Box, MantineColorsTuple } from "@mantine/core";
import { useEffect, useState } from "react";

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
      <GearGroupContainer width={dimensions.width} height={dimensions.height}>
        <g transform="translate(60, 160)">
          <Gear color={colors[3]} hoverColor={colors[5]} teeth={6} module={10} positionAngle={0}>
            <Gear color={colors[2]} hoverColor={colors[4]} teeth={6} module={10} positionAngle={10}>
              <Gear color={colors[4]} hoverColor={colors[6]} teeth={3} module={10} positionAngle={80}>
                <Gear color={colors[2]} hoverColor={colors[4]} teeth={4} module={10} positionAngle={30}>
                  <Gear color={colors[1]} hoverColor={colors[3]} teeth={5} module={10} positionAngle={0}>
                    <Gear color={colors[0]} hoverColor={colors[2]} teeth={12} module={10} positionAngle={0}>
                      <Gear color={colors[2]} hoverColor={colors[4]} teeth={34} module={10} positionAngle={30}></Gear>
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
