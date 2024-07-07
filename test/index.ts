import parse from "static-prompt-config";

console.log(await parse({
  configFilePath: "./prompt/config.json",
  rootPromptFilePath: "./prompt/root.txt",
  cwdForSecondaryPrompts: `${process.cwd()}/prompt`,
}))