import { MantineColorsTuple, MantineTheme, createTheme, useMantineTheme } from "@mantine/core";
import localFont from 'next/font/local';

export const digitalNumbersFont = localFont({
    src: './fonts/DigitalNumbers.ttf',
});

export const pokerFont = localFont({
    src: './fonts/poker/icomoon.ttf',
});

export const MaliFont = localFont({
    src: [
        {
            path: './fonts/Mali/Mali-ExtraLight.ttf',
            weight: '100',
            style: 'normal',
        },
        {
            path: './fonts/Mali/Mali-ExtraLightItalic.ttf',
            weight: '100',
            style: 'italic',
        },
        {
            path: './fonts/Mali/Mali-Light.ttf',
            weight: '300',
            style: 'normal',
        },
        {
            path: './fonts/Mali/Mali-LightItalic.ttf',
            weight: '300',
            style: 'italic',
        },
        {
            path: './fonts/Mali/Mali-Regular.ttf',
            weight: '400',
            style: 'normal',
        },
        {
            path: './fonts/Mali/Mali-Italic.ttf',
            weight: '400',
            style: 'italic',
        },
        {
            path: './fonts/Mali/Mali-Medium.ttf',
            weight: '500',
            style: 'normal',
        },
        {
            path: './fonts/Mali/Mali-MediumItalic.ttf',
            weight: '500',
            style: 'italic',
        },
        {
            path: './fonts/Mali/Mali-SemiBold.ttf',
            weight: '700',
            style: 'normal',
        },
        {
            path: './fonts/Mali/Mali-SemiBoldItalic.ttf',
            weight: '700',
            style: 'italic',
        },
        {
            path: './fonts/Mali/Mali-Bold.ttf',
            weight: '900',
            style: 'normal',
        },
        {
            path: './fonts/Mali/Mali-BoldItalic.ttf',
            weight: '900',
            style: 'italic',
        },
    ],
});

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
    },
    fontFamily: MaliFont.style.fontFamily,
} as const;
export const theme = createTheme(themeConf);

export const useTheme = () => useMantineTheme() as MantineTheme & typeof themeConf;
