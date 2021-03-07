import { ENGINE_HOOKS, TestPresetEntryV4 } from "@dendronhq/common-test-utils";
import { DendronASTDest, MDUtilsV4 } from "@dendronhq/engine-server";
import { runEngineTestV5 } from "../../../engine";
import { checkVFile, createProcTests } from "./utils";

describe("sectionize", () => {
  const sectionizeText = [
    "## Forest elephants",
    "### Introduction",
    "In this section, we discuss the lesser known forest elephants.",
    "### Habitat",
    "Forest elephants do not live in trees but among them.",
  ].join("\n");
  const REGULAR_CASE = createProcTests({
    name: "REGULAR_CASE",
    setupFunc: async ({ engine, vaults, extra }) => {
      // create copy of engine config
      let config = { ...engine.config };
      config.site.useSectionize = true;
      if (extra.dest !== DendronASTDest.HTML) {
        const proc = MDUtilsV4.procFull({
          engine,
          config,
          fname: "foo",
          dest: extra.dest,
          vault: vaults[0],
        });
        const resp = await proc.process(sectionizeText);
        return { resp };
      } else {
        const proc = MDUtilsV4.procHTML({
          engine,
          config,
          fname: "foo",
          noteIndex: engine.notes["foo"],
          vault: vaults[0],
        });
        const resp = await proc.process(sectionizeText);
        return { resp };
      }
    },
    verifyFuncDict: {
      [DendronASTDest.MD_DENDRON]: async ({ extra }) => {
        const { resp } = extra;
        await checkVFile(
          resp,
          "# Forest elephants",
          "## Introduction",
          "In this section, we discuss the lesser known forest elephants.",
          "## Habitat",
          "Forest elephants do not live in trees but among them."
        );
      },
      [DendronASTDest.HTML]: async ({ extra }) => {
        const { resp } = extra;
        expect(resp).toMatchSnapshot();
      },
    },
    preSetupHook: ENGINE_HOOKS.setupBasic,
  });
  const NOT_ENABLED = createProcTests({
    name: "NOT_ENABLED",
    setupFunc: async ({ engine, vaults, extra }) => {
      // create copy of engine config
      let config = { ...engine.config };
      if (extra.dest !== DendronASTDest.HTML) {
        const proc = MDUtilsV4.procFull({
          engine,
          config,
          fname: "foo",
          dest: extra.dest,
          vault: vaults[0],
        });
        const resp = await proc.process(sectionizeText);
        return { resp };
      } else {
        const proc = MDUtilsV4.procHTML({
          engine,
          config,
          fname: "foo",
          noteIndex: engine.notes["foo"],
          vault: vaults[0],
        });
        const resp = await proc.process(sectionizeText);
        return { resp };
      }
    },
    verifyFuncDict: {
      [DendronASTDest.MD_DENDRON]: async ({ extra }) => {
        const { resp } = extra;
        await checkVFile(
          resp,
          "# Forest elephants",
          "## Introduction",
          "In this section, we discuss the lesser known forest elephants.",
          "## Habitat",
          "Forest elephants do not live in trees but among them."
        );
      },
      [DendronASTDest.HTML]: async ({ extra }) => {
        const { resp } = extra;
        expect(resp).toMatchSnapshot();
      },
    },
    preSetupHook: ENGINE_HOOKS.setupBasic,
  });

  const ALL_TEST_CASES = [...REGULAR_CASE, ...NOT_ENABLED];
  test.each(
    ALL_TEST_CASES.map((ent) => [`${ent.dest}: ${ent.name}`, ent.testCase])
  )("%p", async (_key, testCase: TestPresetEntryV4) => {
    await runEngineTestV5(testCase.testFunc, {
      expect,
      preSetupHook: testCase.preSetupHook,
    });
  });
});
