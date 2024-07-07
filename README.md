# static-prompt-config

**A Simple library that allows the merger of multiple files into one. Can be used to compose system prompts for ChatGPT**

## Usage

### **- config.json (Required)**

Configures your prompt composition

```json
{
    // key: string, name of the secondary prompt
    // filePath: string, path to the file containing the secondary prompt
    "prompts": {
        [key]: "filePath"
    }
}
```

### **- root.txt (Required)**

The root prompt. Used to define the schematic that your secondary prompts will be placed in

```text
This is a test prompt. Here's the "hello" secondary prompt: 

{{hello}}
```
### **- Referencing Secondary Prompts**

You may have noticed the usage of `{{hello}}` above to mention the "hello" prompt. That's a reference to the `hello` Secondary Prompt. Use them as many times necessary
