"use client"
import { useTheme } from "@/app/theme";
import { Gear, GearGroupContainer } from "@/app/widgets/Gear";
import { Box, Center, MantineColorsTuple } from "@mantine/core";
import { useEffect, useState } from "react";
export const GearGroup: React.FC<{ colors: MantineColorsTuple }> = ({ colors }) => {
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(800);
  useEffect(() => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  }, []);

  return (
    <Center>
      <Box>
        <GearGroupContainer width={width} height={height}>
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
    </Center>
  )
}

export default function Home() {
  const theme = useTheme();
  return <GearGroup colors={theme.colors.gameMain} />;
}
