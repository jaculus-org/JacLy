# Block definition

Multiple blocks creates a toolbox category in Jacly. Each category is defined using single JSON file.

The block definition is stored in the `content` key of the category definition file.

```json
{
  ...
  "name": "GPIO",
  ...
  "contents": [
    {
      "kind": "block", //
      "type": "gpio_pinMode", // (unique string) block type identifier
      "message0": "set pin $[PIN] mode to $[MODE]", // (string) content of the block with placeholders for inputs

      // (array) list of input definitions
      "args0": [
        {
          "type": "input_value",
          "name": "PIN", // (string) input name, used as a placeholder in message0
          "check": "Number", // (string or array) type(s) of input accepted

          // shadow can be defined in arguments or down in inputs
          "shadow": { // (object) shadow block definition for the dropdown
            "type": "math_number",
            "fields": {
              "NUM": 5
            }
          }
        },
        {
          "type": "field_dropdown", // (string) type of input, dropdown field
          "name": "MODE",
          "options": [ // (array) list of dropdown options
            ["OUTPUT", "gpio.PinMode.OUTPUT"],
            ["INPUT", "gpio.PinMode.INPUT"],
            ["INPUT_PULLUP", "gpio.PinMode.INPUT_PULLUP"],
            ["INPUT_PULLDOWN", "gpio.PinMode.INPUT_PULLDOWN"],
            ["DISABLE", "gpio.PinMode.DISABLE"]
          ],
        }
      ],

      // alternative way to define shadows for inputs
      "inputs": {
        "PIN": { // name of the input to define shadow for
          "shadow": {
            "type": "math_number",
            "fields": {
              "NUM": 5
            }
          }
        }
      },
      "tooltip": "Set the mode of the specified pin",
      "code": "gpio.pinMode($[PIN], $[MODE]);", // (string) generated code with placeholders for inputs

      // (optional) block connections (null means can connect to any)
      "previousStatement": null,
      "nextStatement": null
    },
    ...
  ]
}
```

## Special JacLy extensions for block definitions

### Objects with context created by Constructor

If you need to define blocks that operate on objects created by a constructor, you can use the `"constructs": "keyValue"` and `"instanceof": "keyValue"` properties.

This syntax will automatically create variables for the instances of the objects and automatically updates dropdown selector of the instances in the blocks.

You can look at the `keyvalue` library blocks for examples of this feature.

Definition of the constructor block:

```json
{
  ...
  "name": "KeyValueStorage",
  ...
  "contents": [
    {
      "kind": "block",
      "type": "kv_open",
      "message0": "open $[CONSTRUCTED_VAR_NAME] namespace $[NAMESPACE]",
      "args0": [
        {
          "type": "field_input",
          "name": "CONSTRUCTED_VAR_NAME", // this is special name, has to be exactly this
          "text": "keyValue_?" // variable name pattern, <constructed_var_name>_? -> keyValue_1, keyValue_2, ...
        },
        {
          "type": "input_value",
          "name": "NAMESPACE",
          "check": "String",
          "shadow": {
            "type": "text",
            "fields": {
              "TEXT": "default"
            }
          }
        }
      ],
      "constructs": "keyValue", // indicates that this block constructs an object of type keyValue (has to match instanceof in other blocks)
      "tooltip": "Initialize an Key Value Storage namespace",
      "code": "const $[CONSTRUCTED_VAR_NAME] = keyvalue.open($[NAMESPACE]);",
      "previousStatement": null,
      "nextStatement": null
    },
  ]
}
```

Usage in other blocks:

```json
    {
      "kind": "block",
      "type": "kv_set_string",
      "message0": "set KV $[KV_INSTANCE] key $[KEY] to string value $[VALUE]",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "KV_INSTANCE",
          "instanceof": "keyValue"
        },
        {
          "type": "input_value",
          "name": "KEY",
          "check": "String",
          "shadow": {
            "type": "text",
            "fields": {
              "TEXT": "my_key"
            }
          }
        },
        {
          "type": "input_value",
          "name": "VALUE",
          "check": "String",
          "shadow": {
            "type": "text",
            "fields": {
              "TEXT": "my_value"
            }
          }
        }
      ],
      "tooltip": "Set a string value in NVS for the specified key",
      "code": "$[KV_INSTANCE].set($[KEY], $[VALUE]);",
      "previousStatement": null,
      "nextStatement": null
    },
...
```

## Translations

JacLy blocks support internationalization through the `%T%` translation syntax. This allows you to define translatable strings in your block definitions and provide translations in separate language files.

### The `%T%` Syntax

Use `%T%` as a placeholder in any translatable field. The system automatically generates a translation key based on the field location:

| Field Location         | Generated Key Pattern                       |
| ---------------------- | ------------------------------------------- |
| Category `name`        | `{CATEGORY}_NAME`                           |
| Category `description` | `{CATEGORY}_DESCRIPTION`                    |
| Block `message0`       | `{BLOCK_TYPE}_MESSAGE0`                     |
| Block `tooltip`        | `{BLOCK_TYPE}_TOOLTIP`                      |
| Label `text`           | `{CATEGORY}_LABEL_{TEXT}`                   |
| Dropdown option        | `{BLOCK_TYPE}_ARGS0_FIELD_DROPDOWN_{VALUE}` |

> **Note:** All keys are converted to UPPERCASE. The `{CATEGORY}` is taken from the `category` field, and `{BLOCK_TYPE}` from the block's `type` field.

### Example Block Definition with Translations

```json
{
  "category": "basic",
  "name": "%T%",
  "description": "%T%",
  "contents": [
    {
      "kind": "block",
      "type": "basic_onStart",
      "message0": "%T%",
      "args0": [
        {
          "type": "input_statement",
          "name": "CODE"
        }
      ],
      "tooltip": "%T%",
      "code": "$[CODE]\n"
    },
    {
      "kind": "label",
      "text": "Intervals"
    }
  ]
}
```

### Translation File Structure

Translation files are stored in a `translations/` subdirectory next to your `*.jacly.json` files. Each language has its own file named `{lang}.lang.json`:

```
blocks/
├── basic.jacly.json
└── translations/
    ├── en.lang.json
    └── cs.lang.json
```

### Example Translation File (`en.lang.json`)

```json
{
  "BASIC_NAME": "Basic",
  "BASIC_DESCRIPTION": "Basic task control blocks.",

  "BASIC_ONSTART_MESSAGE0": "on start",
  "BASIC_ONSTART_TOOLTIP": "Run code when the program starts",

  "BASIC_LABEL_INTERVALS": "Intervals"
}
```

### Key Generation Rules

1. **Category fields**: `{CATEGORY}_NAME`, `{CATEGORY}_DESCRIPTION`
2. **Block message/tooltip**: `{BLOCK_TYPE}_MESSAGE0`, `{BLOCK_TYPE}_TOOLTIP`
3. **Labels**: `{CATEGORY}_LABEL_{KEY}` (using `%KEY%` syntax)
4. **Dropdown options**: `{BLOCK_TYPE}_ARGS0_FIELD_DROPDOWN_{KEY}` (using `%KEY%` syntax)

### Translating Labels

Use the `%KEY%` syntax for label text. The system will look up the translation key `{CATEGORY}_LABEL_{KEY}`:

**In jacly.json:**

```json
{
  "kind": "label",
  "text": "%IN_FUTURE_RELEASES%"
}
```

**In translation file:**

```json
{
  "I2C_LABEL_IN_FUTURE_RELEASES": "I2C Read/Write will be added in future releases."
}
```

> **Note:** The key inside `%...%` becomes the suffix of the translation key. For `%IN_FUTURE_RELEASES%` in category `i2c`, the key is `I2C_LABEL_IN_FUTURE_RELEASES`.

### Translating Dropdown Options

Use the `%KEY%` syntax for dropdown option labels. The system will look up the translation key `{BLOCK_TYPE}_ARGS0_FIELD_DROPDOWN_{KEY}`:

**In jacly.json:**

```json
{
  "type": "field_dropdown",
  "name": "MODE",
  "options": [
    ["%OUTPUT%", "gpio.PinMode.OUTPUT"],
    ["%INPUT%", "gpio.PinMode.INPUT"],
    ["%DISABLE%", "gpio.PinMode.DISABLE"]
  ]
}
```

**In translation file:**

```json
{
  "GPIO_PINMODE_ARGS0_FIELD_DROPDOWN_OUTPUT": "OUTPUT",
  "GPIO_PINMODE_ARGS0_FIELD_DROPDOWN_INPUT": "INPUT",
  "GPIO_PINMODE_ARGS0_FIELD_DROPDOWN_DISABLE": "DISABLE"
}
```

> **Note:** The key inside `%...%` becomes the suffix of the translation key. For `%OUTPUT%` in block type `gpio_pinMode`, the key is `GPIO_PINMODE_ARGS0_FIELD_DROPDOWN_OUTPUT`.

### Using Placeholders in Translations

Include input placeholders in your translations using the `$[INPUT_NAME]` syntax:

```json
{
  "BASIC_PAUSE_MESSAGE0": "pause (ms) $[TIME]",
  "BASIC_SET_INTERVAL_MESSAGE0": "set interval name $[CONSTRUCTED_VAR_NAME]\n do $[CODE] every $[TIME] ms"
}
```
