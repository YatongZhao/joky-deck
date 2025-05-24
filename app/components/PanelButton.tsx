import { darken, DefaultMantineColor, Flex, MantineStyleProps, parseThemeColor, StyleProp } from "@mantine/core";
import React, { ReactNode } from "react";
import { useHover } from "@mantine/hooks";
import { useTheme } from "../theme";
import style from './PanelButton.module.scss';
import classNames from "classnames";

export const PanelButton: React.FC<{
  children?: ReactNode;
  buttonColor: StyleProp<DefaultMantineColor>;
  disabled?: boolean;
  onClick?: () => void;
} & MantineStyleProps> = ({ children, buttonColor, onClick, disabled, ...styleProps }) => {
  const { hovered, ref } = useHover();
  const theme = useTheme();

  const targetColor = disabled ? 'dark.3' : buttonColor;
  const parsedColor = parseThemeColor({ color: targetColor, theme });
  const bgColor = parsedColor.isThemeColor ? `var(${parsedColor.variable})` : parsedColor.value;

  return (
    <Flex
      ref={ref}
      c={disabled ? 'dark.1' : "white"}
      justify="center"
      align="center"
      direction="column"
      lh={1}
      fz={16}
      onClick={() => !disabled && onClick?.()}
      {...styleProps}
      className={classNames(style.button, { [style.disabled!]: disabled })}
      style={{
        borderRadius: 7,
        cursor: 'pointer',
        backgroundColor: hovered ? darken(bgColor, .3) : bgColor,
      }}
    >
      {children}
    </Flex>
  );
}
