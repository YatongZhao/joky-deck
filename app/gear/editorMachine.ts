import { assign, setup } from "xstate";
import { createActorContext } from "@xstate/react";
// import { createBrowserInspector } from '@statelyai/inspect'
// import { useEffect } from "react";

export const editorMachine = setup({
  types: {
    context: {} as { selectedGearId: string | null },
    events: {} as
      | { type: "selectGear"; gearId: string }
      | { type: "enterAddingMode" }
      | { type: "enterViewPortSetting" }
      | { type: "enterSelecting" }
      | { type: "exitAddingMode" }
      | { type: "esc" },
  },
  actions: {
    assignGearId: assign({
      selectedGearId: (context, event: { gearId: string | null }) => {
        return event.gearId;
      },
    }),
  },
  guards: {
    isNewGear: ({ context }, event: { gearId: string }) => {
      return context.selectedGearId !== event.gearId;
    },
  },
}).createMachine({
  context: {
    selectedGearId: null,
  },
  id: "Editor",
  initial: "Selecting",
  states: {
    Selecting: {
      initial: "NoGearSelected",
      on: {
        enterViewPortSetting: {
          target: "ViewportSetting",
        },
      },
      states: {
        NoGearSelected: {
          on: {
            selectGear: {
              target: "GearSelected",
              actions: {
                type: "assignGearId",
                params: ({ event }) => ({ gearId: event.gearId }),
              },
            },
          },
        },
        GearSelected: {
          initial: "Default",
          on: {
            selectGear: [
              {
                target: "GearSelected",
                actions: {
                  type: "assignGearId",
                  params: ({ event }) => ({ gearId: event.gearId }),
                },
                guard: {
                  type: "isNewGear",
                  params: ({ event }) => ({ gearId: event.gearId }),
                },
              },
              {
                target: "NoGearSelected",
              }
            ],
          },
          exit: {
            type: 'assignGearId',
            params: { gearId: null },
          },
          states: {
            Default: {
              on: {
                enterAddingMode: {
                  target: "AddingGear",
                },
                esc: {
                  target: "#Editor.Selecting.NoGearSelected",
                },
              },
              tags: ["CanEscape"],
            },
            AddingGear: {
              on: {
                exitAddingMode: {
                  target: "Default",
                },
                esc: {
                  target: "Default",
                },
              },
              tags: ["AddingMode", "CanEscape"],
            },
          },
        },
      },
    },
    ViewportSetting: {
      on: {
        enterSelecting: {
          target: "Selecting",
        },
      },
    },
  },
});

// export const useEditorMachine = () => {
//   const result = useActor(editorMachine);

//   const [state, send, actor] = result;

//   useEffect(() => {
//     actor.subscribe((state) => {
//       console.log('state', state);
//     });
//   }, [actor]);

//   useEffect(() => {
//     console.log('state', state);
//   }, [state]);

//   return result;

// }

export const EditorMachineContext = createActorContext(editorMachine);
