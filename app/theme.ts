import { MantineColorsTuple, MantineTheme, createTheme, useMantineTheme } from "@mantine/core";

// const gameMain: MantineColorsTuple = [
//     '#ecf4ff',
//     '#dce4f5',
//     '#b9c7e2',
//     '#94a8d0',
//     '#748dc0',
//     '#5f7cb7',
//     '#5474b4',
//     '#44639f',
//     '#3a5890',
//     '#2c4b80'
// ];
// const gameMain: MantineColorsTuple = [
//     "#f5f5f5",
//     "#e7e7e7",
//     "#cdcdcd",
//     "#b2b2b2",
//     "#9a9a9a",
//     "#8b8b8b",
//     "#848484",
//     "#717171",
//     "#656565",
//     "#575757"
// ];
// const gameMain: MantineColorsTuple = [
//     "#eff2ff",
//     "#dfe2f2",
//     "#bdc2de",
//     "#99a0ca",
//     "#7a84b9",
//     "#6672af",
//     "#5c69ac",
//     "#4c5897",
//     "#424e88",
//     "#36437a"
// ];

const gameMains: MantineColorsTuple[] = [
    [
        "#f5f5f5",
        "#e7e7e7",
        "#cdcdcd",
        "#b2b2b2",
        "#9a9a9a",
        "#8b8b8b",
        "#848484",
        "#717171",
        "#656565",
        "#575757"
    ],
    [
        '#ecf4ff',
        '#dce4f5',
        '#b9c7e2',
        '#94a8d0',
        '#748dc0',
        '#5f7cb7',
        '#5474b4',
        '#44639f',
        '#3a5890',
        '#2c4b80'
    ],
    [
        "#eff2ff",
        "#dfe2f2",
        "#bdc2de",
        "#99a0ca",
        "#7a84b9",
        "#6672af",
        "#5c69ac",
        "#4c5897",
        "#424e88",
        "#36437a"
    ]
];

const themeConf: ReturnType<typeof createTheme> = {
    scale: 2,
    colors: {
        gameMain: gameMains[2],
    }
} as const;
export const theme = createTheme(themeConf);

export const useTheme = () => useMantineTheme() as MantineTheme & typeof themeConf;
