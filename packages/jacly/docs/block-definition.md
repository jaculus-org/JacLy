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
