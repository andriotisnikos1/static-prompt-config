import path from "path";
import fsp from "fs/promises";

interface IParserOptions {
    // relative path to the config file (uses process.cwd() as base)
  configFilePath: string;
    // relative path to the root prompt file (uses process.cwd() as base)
  rootPromptFilePath: string;
  // cwd to use for secondary prompts (uses process.cwd() as default)
    cwdForSecondaryPrompts?: string;
}

interface IPromptFile {
  prompts: {
    [key: string]: string;
  };
}

// Main parser function
export default async function parse({
  configFilePath,
  rootPromptFilePath,
  cwdForSecondaryPrompts = process.cwd(),
}: IParserOptions): Promise<string | null> {
  try {
    const config = await readConfigFile(configFilePath);
    if (!config)
      throw new Error(
        "Config file is invalid or missing. Must be a valid JSON file with a 'prompts' key."
      );
    const rootPrompt = await readRootPrompt(rootPromptFilePath);
    if (!rootPrompt)
      throw new Error(
        "Root prompt file is invalid or missing. Must be a valid text file."
      );
    const secondaryPrompts = await readSecondaryPrompts(config.prompts, cwdForSecondaryPrompts);
    let result = rootPrompt;
    const keys = Object.keys(secondaryPrompts);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = secondaryPrompts[key];
        while (result.includes(`{{${key}}}`)) {
          result = result.replace(`{{${key}}}`, value);
        }
    }
    return result;
  } catch (error) {
    const err = error as Error;
    console.log(
      `[static-prompt-config (parser)] Error: ${err.message}\n\nStack:\n[${err.stack}`
    );
    return null;
  }
}

async function readSecondaryPrompts(
  prompts: IPromptFile["prompts"],
  cwd: string
): Promise<{
  [key: string]: string;
}> {
  const keys = Object.keys(prompts);
  const results: string[] = [];
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = prompts[key];
    const filePath = path.join(cwd, value);
    try {
      const content = await fsp.readFile(filePath, "utf-8");
      results.push(content);
    } catch (error) {
      const err = error as Error;
      console.log(
        `[static-prompt-config (parser)] Error reading secondary prompt file: ${filePath}`
      );
      console.log(`Error: ${err.message}\n\nStack:\n[${err.stack}`);
    }
  }

  const result: {
    [key: string]: string;
  } = {};
  for (let i = 0; i < keys.length; i++) {
    result[keys[i]] = results[i];
  }
  return result;
}

async function readRootPrompt(
  rootPromptFilePath: string
): Promise<string | null> {
  try {
    const content = await fsp.readFile(rootPromptFilePath, "utf-8");
    return content;
  } catch (error) {
    return null;
  }
}

async function readConfigFile(
  configFilePath: string
): Promise<IPromptFile | null> {
  try {
    const content = await fsp.readFile(configFilePath, "utf-8");
    const json = JSON.parse(content) as IPromptFile;
    if (!json.prompts) return null;
    return json;
  } catch (error) {
    return null;
  }
}
