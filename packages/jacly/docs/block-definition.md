# Block definition

Multiple blocks create a toolbox category in JacLy. Each category is defined using a single JSON file (`*.jacly.json`).

The block definitions are stored in the `contents` array of the category definition file.

## Basic Block Structure

```json
{
  "category": "gpio",
  "name": "GPIO",
  "contents": [
    {
      "kind": "block",
      "type": "gpio_pinMode",
      "message0": "set pin $[PIN] mode to $[MODE]",
      "args0": [
        {
          "type": "input_value",
          "name": "PIN",
          "check": "Number",
          "shadow": {
            "type": "math_number",
            "fields": { "NUM": 5 }
          }
        },
        {
          "type": "field_dropdown",
          "name": "MODE",
          "options": [
            ["OUTPUT", "gpio.PinMode.OUTPUT"],
            ["INPUT", "gpio.PinMode.INPUT"],
            ["DISABLE", "gpio.PinMode.DISABLE"]
          ]
        }
      ],
      "tooltip": "Set the mode of the specified pin",
      "code": "gpio.pinMode($[PIN], $[MODE]);",
      "previousStatement": null,
      "nextStatement": null
    }
  ]
}
```

### Block Properties Reference

| Property            | Type           | Description                                                              |
| ------------------- | -------------- | ------------------------------------------------------------------------ |
| `kind`              | `"block"`      | Must be `"block"` for block definitions                                  |
| `type`              | string         | Unique block type identifier (e.g. `"gpio_pinMode"`)                     |
| `message0`          | string         | Block label with `$[ARG_NAME]` placeholders for inputs                   |
| `args0`             | array          | Input/field definitions (see [Argument Types](#argument-types))          |
| `tooltip`           | string         | Tooltip shown on hover                                                   |
| `code`              | string         | Generated code template with `$[ARG_NAME]` placeholders                  |
| `codeConditionals`  | array          | Conditional code templates (see [Code Conditionals](#code-conditionals)) |
| `output`            | string \| null | Output type for value blocks (e.g. `"Number"`, `"String"`)               |
| `previousStatement` | string \| null | Allows connection above (`null` = any type)                              |
| `nextStatement`     | string \| null | Allows connection below (`null` = any type)                              |
| `inputs`            | object         | Alternative shadow/block definitions keyed by input name                 |
| `inputsInline`      | boolean        | Whether inputs render inline                                             |
| `hideInToolbox`     | boolean        | If `true`, block is registered but hidden from toolbox                   |

> **Note:** A block cannot have both `output` and `previousStatement`/`nextStatement`. Use `output` for value blocks (reporters) or statement connections for stackable blocks.

## Argument Types

### `input_value` — Value Input

Accepts a plugged-in block that produces a value.

```json
{
  "type": "input_value",
  "name": "PIN",
  "check": "Number",
  "shadow": {
    "type": "math_number",
    "fields": { "NUM": 5 }
  }
}
```

- `check` — accepted type(s): `"Number"`, `"String"`, `"Boolean"`, or an array like `["Number", "String"]`
- `shadow` — default block shown when nothing is plugged in (can also be defined in the `inputs` object)

### `field_dropdown` — Dropdown Field

Static dropdown with predefined options:

```json
{
  "type": "field_dropdown",
  "name": "MODE",
  "options": [
    ["OUTPUT", "gpio.PinMode.OUTPUT"],
    ["INPUT", "gpio.PinMode.INPUT"]
  ]
}
```

Each option is `[label, value]`. The `value` is used in code generation via `$[MODE]`.

### `field_input` — Text Input Field

Free-text input field:

```json
{
  "type": "field_input",
  "name": "CONSTRUCTED_VAR_NAME",
  "text": "keyValue_?"
}
```

### `field_number` — Number Input Field

```json
{
  "type": "field_number",
  "name": "VALUE",
  "value": 0,
  "min": -100,
  "max": 100,
  "precision": 1
}
```

### `input_statement` — Statement Input

Accepts a stack of blocks (used for callbacks, loops, etc.):

```json
{
  "type": "input_statement",
  "name": "CODE"
}
```

### `input_dummy` — Dummy Input

Used for layout purposes (line breaks, alignment):

```json
{
  "type": "input_dummy",
  "name": "DUMMY"
}
```

### Shadow Blocks via `inputs`

An alternative way to define shadow blocks, keyed by argument name:

```json
{
  "args0": [{ "type": "input_value", "name": "PIN", "check": "Number" }],
  "inputs": {
    "PIN": {
      "shadow": {
        "type": "math_number",
        "fields": { "NUM": 5 }
      }
    }
  }
}
```

## Code Generation

### Simple Code Template

Use `$[ARG_NAME]` placeholders that get replaced with argument values:

```json
{
  "code": "gpio.pinMode($[PIN], $[MODE]);"
}
```

### Code Conditionals

When the generated code depends on a dropdown selection, use `codeConditionals`:

```json
{
  "args0": [
    {
      "type": "field_dropdown",
      "name": "UNIT",
      "options": [
        ["%DISTANCE_MM%", "distance"],
        ["%TIME_MS%", "time"],
        ["%INFINITE%", "infinite"]
      ]
    }
  ],
  "codeConditionals": [
    {
      "condition": [{ "$[UNIT]": "distance" }],
      "code": "await $[DRIVE_INSTANCE].move($[CURVE], { distance: $[DURATION] });"
    },
    {
      "condition": [{ "$[UNIT]": "time" }],
      "code": "await $[DRIVE_INSTANCE].move($[CURVE], { time: $[DURATION] });"
    },
    {
      "condition": [{ "$[UNIT]": "infinite" }],
      "code": "await $[DRIVE_INSTANCE].move($[CURVE]);"
    }
  ]
}
```

Each conditional has:

- `condition` — array of `{ "$[FIELD_NAME]": "expected_value" }` objects (all must match)
- `code` — the code template to use when conditions match

If no conditional matches, `code` (the default) is used as fallback.

## Labels

Labels are non-interactive text elements that organize blocks within a toolbox category into visual sections.

```json
{
  "kind": "label",
  "text": "%SETUP%"
}
```

Labels support the `%KEY%` syntax for translations (see [Translating Labels](#translating-labels)). You can also use plain text:

```json
{
  "kind": "label",
  "text": "Movement"
}
```

**Multi-line labels:** If the label text contains `\n`, it is automatically expanded into multiple consecutive label items in the toolbox. This is useful when a label text from translation is long:

```json
{
  "LEDC_LABEL_STOP": "Stop blocks will stop the timer or channel, which will stop the PWM signal.",
  "LEDC_LABEL_STOP2": "Note: a timer can only be stopped after all its channels have been stopped."
}
```

## Usage-Only Block References

You can include blocks from other categories in your toolbox without redefining them. Just reference them by type:

```json
{
  "kind": "block",
  "type": "differential_drive_move"
}
```

When a block has only `kind` and `type` (no `message0`, `args0`, or `code`), it's treated as a **usage-only reference**. The block inherits color from the current category but uses the definition and code generator already registered by its original category.

Example from `robutek2.jacly.json` — showing differential drive blocks in the robutek toolbox:

```json
{
  "contents": [
    { "kind": "label", "text": "%MOVEMENT%" },
    { "kind": "block", "type": "differential_drive_move" },
    { "kind": "block", "type": "differential_drive_rotate" },
    { "kind": "block", "type": "differential_drive_stop" }
  ]
}
```

Usage-only references also **inherit shadows and default inputs** from the original block registration. You can override specific inputs while keeping the rest:

```json
{
  "kind": "block",
  "type": "differential_drive_stop",
  "inputs": {
    "BRAKE": {
      "shadow": { "type": "logic_boolean", "fields": { "BOOL": 1 } }
    }
  }
}
```

## Hidden Helper Blocks (`hideInToolbox`)

Some blocks are only useful when pre-connected inside other blocks, not as standalone toolbox items. Use `"hideInToolbox": true` to register the block (so it works in the workspace) but hide it from the toolbox:

```json
{
  "kind": "block",
  "type": "vl53l0x_read_measurement",
  "message0": "%T%",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "SENSOR_INSTANCE",
      "instanceof": "vl53l0x"
    }
  ],
  "hideInToolbox": true,
  "tooltip": "%T%",
  "code": "(await $[SENSOR_INSTANCE].read())",
  "output": "VL53L0XMeasurement"
}
```

This block is registered and generates code, but users won't see it cluttering the toolbox. It appears only when pre-connected inside another block (see below).

## Pre-Connected Block References

When defining `input_value` arguments, you can pre-connect a block (not just a shadow) using the `block` property. You can also pre-fill its fields with default values using `fields`:

```json
{
  "type": "input_value",
  "name": "DATETIME",
  "check": "RtcDateTime",
  "block": {
    "type": "ds3231_read_field",
    "fields": {
      "SENSOR_INSTANCE": "ds3231_?"
    }
  }
}
```

Key differences from `shadow`:

- **`shadow`** — a default value block that gets replaced when the user connects another block (and reappears when removed)
- **`block`** — a real connected block that can be detached and rearranged, starts pre-connected for convenience

The `fields` property sets initial field values on the pre-connected block (e.g. the dropdown defaults to `"ds3231_?"`).

> **Note:** Pre-connected blocks automatically inherit their own shadows/inputs from their registration. You don't need to re-specify the nested block's shadows.

## Object Unpacking Pattern

When a function returns a complex object (like a measurement with multiple fields), use a **read + unpack** pattern to keep blocks simple for users:

1. **A hidden "read" block** — calls the function and outputs a custom type
2. **A visible "unpack" block** — takes the object as input and extracts a field via dropdown

### Example: VL53L0X Distance Sensor

The `VL53L0X.read()` method returns `{ distance, signalRate, ambientRate, effectiveSpadRtnCount }`.

**Hidden read block** (registered but not in toolbox):

```json
{
  "type": "vl53l0x_read_measurement",
  "hideInToolbox": true,
  "code": "(await $[SENSOR_INSTANCE].read())",
  "output": "VL53L0XMeasurement"
}
```

**Visible unpack block** (with the read block pre-connected):

```json
{
  "type": "vl53l0x_unpack_measurement",
  "args0": [
    {
      "type": "input_value",
      "name": "MEASUREMENT",
      "check": "VL53L0XMeasurement",
      "block": {
        "type": "vl53l0x_read_measurement",
        "fields": { "SENSOR_INSTANCE": "vl53l0x_?" }
      }
    },
    {
      "type": "field_dropdown",
      "name": "FIELD",
      "options": [
        ["%DISTANCE%", "distance"],
        ["%SIGNAL_RATE%", "signalRate"]
      ]
    }
  ],
  "code": "$[MEASUREMENT].$[FIELD]",
  "output": "Number"
}
```

**Generated code:** `(await vl53l0x_0.read()).distance`

This pattern gives users a clean single block in the toolbox that handles both the read and the field selection, while keeping the code generation modular. The custom output type (e.g. `VL53L0XMeasurement`) ensures only compatible blocks can be connected.

---

## Special JacLy Extensions

### Constructor & Instance System (`constructs` / `instanceof`)

If you need blocks that operate on objects created by a constructor, use `"constructs"` and `"instanceof"`.

This syntax automatically manages variable naming and populates instance dropdown selectors.

#### Constructor Block

```json
{
  "kind": "block",
  "type": "kv_open",
  "message0": "open $[CONSTRUCTED_VAR_NAME] namespace $[NAMESPACE]",
  "args0": [
    {
      "type": "field_input",
      "name": "CONSTRUCTED_VAR_NAME",
      "text": "keyValue_?"
    },
    {
      "type": "input_value",
      "name": "NAMESPACE",
      "check": "String",
      "shadow": { "type": "text", "fields": { "TEXT": "default" } }
    }
  ],
  "constructs": "keyValue",
  "tooltip": "Initialize a Key Value Storage namespace",
  "code": "const $[CONSTRUCTED_VAR_NAME] = keyvalue.open($[NAMESPACE]);",
  "previousStatement": null,
  "nextStatement": null
}
```

Key points:

- `"name": "CONSTRUCTED_VAR_NAME"` — **must be exactly this name**
- `"text": "keyValue_?"` — the `?` is auto-replaced with an incrementing number (`keyValue_0`, `keyValue_1`, ...)
- `"constructs": "keyValue"` — registers this block as a constructor for type `keyValue`

#### Instance Usage Block

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
    ...
  ],
  "code": "$[KV_INSTANCE].set($[KEY], $[VALUE]);",
  "previousStatement": null,
  "nextStatement": null
}
```

The `"instanceof": "keyValue"` on a `field_dropdown` (without `options`) creates a dynamic dropdown that lists all constructor instances of type `keyValue` in the workspace.

### Virtual Instances (`virtualInstances`)

When a class extends or wraps other objects (e.g. `Robutek extends DifferentialDrive` and owns `leftMotor`/`rightMotor`), you can expose those sub-objects as virtual instances. This lets users work with existing blocks from other categories (like `differential_drive_move` or `motor_setSpeed`) directly through the parent constructor, without duplicating block definitions.

#### Definition on the Constructor Block

```json
{
  "kind": "block",
  "type": "robutek2_constructor",
  "message0": "%T%",
  "args0": [
    {
      "type": "field_input",
      "name": "CONSTRUCTED_VAR_NAME",
      "text": "robutek2_?"
    }
  ],
  "constructs": "robutek2",
  "virtualInstances": [
    {
      "instanceof": "differential_drive",
      "name": "r_differential",
      "connection": "$[CONSTRUCTED_VAR_NAME]."
    },
    {
      "instanceof": "motor",
      "name": "leftMotor",
      "connection": "$[CONSTRUCTED_VAR_NAME].leftMotor"
    },
    {
      "instanceof": "motor",
      "name": "rightMotor",
      "connection": "$[CONSTRUCTED_VAR_NAME].rightMotor"
    }
  ],
  "code": "const $[CONSTRUCTED_VAR_NAME] = createRobutek(\"V2\");",
  "previousStatement": null,
  "nextStatement": null
}
```

#### How It Works

Each virtual instance entry has:

| Property     | Description                                                                                               |
| ------------ | --------------------------------------------------------------------------------------------------------- |
| `instanceof` | The type of the virtual instance (must match a `"constructs"` type from another category)                 |
| `name`       | Display name for this sub-instance (e.g. `"leftMotor"`)                                                   |
| `connection` | Code expression template. `$[CONSTRUCTED_VAR_NAME]` is replaced with the actual constructor variable name |

When a user creates a `robutek2_constructor` block named `robutek2_0`:

- `differential_drive` blocks (e.g. `differential_drive_move`) will show `robutek2_0.r_differential` in their instance dropdowns
- `motor` blocks (e.g. `motor_setSpeed`) will show `robutek2_0.leftMotor` and `robutek2_0.rightMotor`
- Code generation resolves the `connection` expression:
  - `"$[CONSTRUCTED_VAR_NAME]."` → `robutek2_0.` (for inherited methods like `move()`, `rotate()`)
  - `"$[CONSTRUCTED_VAR_NAME].leftMotor"` → `robutek2_0.leftMotor` (for owned sub-objects)

Combine with [usage-only references](#usage-only-block-references) to show blocks from other categories in your toolbox:

```json
{
  "contents": [
    { "kind": "label", "text": "%MOVEMENT%" },
    { "kind": "block", "type": "differential_drive_move" },
    { "kind": "block", "type": "differential_drive_rotate" },
    { "kind": "block", "type": "differential_drive_stop" }
  ]
}
```

> **Note:** Virtual instances are tracked by the constructor block's internal ID, so renaming the constructor variable automatically updates all generated code.

---

## Translations

JacLy blocks support internationalization through the `%T%` and `%KEY%` translation syntax.

### File Structure

Translation files are stored in a `translations/` subdirectory next to your `*.jacly.json` files. Each language has its own file named `{lang}.lang.json`:

```
blocks/
├── adc.jacly.json
├── gpio.jacly.json
└── translations/
    ├── en.lang.json
    └── cs.lang.json
```

> **Note:** Multiple category definitions can share the same `translations/` directory. A single `en.lang.json` can contain translations for all categories defined in that library.

### The `%T%` Syntax

Use `%T%` as a placeholder in any translatable field. The system automatically generates a translation key based on the field location:

| Field Location         | Generated Key Pattern    |
| ---------------------- | ------------------------ |
| Category `name`        | `{CATEGORY}_NAME`        |
| Category `description` | `{CATEGORY}_DESCRIPTION` |
| Block `message0`       | `{BLOCK_TYPE}_MESSAGE0`  |
| Block `tooltip`        | `{BLOCK_TYPE}_TOOLTIP`   |

> **Note:** All keys are converted to UPPERCASE. `{CATEGORY}` is taken from the `category` field, and `{BLOCK_TYPE}` from the block's `type` field.

**Example — block definition:**

```json
{
  "category": "adc",
  "name": "%T%",
  "description": "%T%",
  "contents": [
    {
      "kind": "block",
      "type": "adc_configure",
      "message0": "%T%",
      "tooltip": "%T%",
      "code": "adc.configure($[PIN], $[ATTEN]);"
    }
  ]
}
```

**Example — translation file (`en.lang.json`):**

```json
{
  "ADC_NAME": "ADC",
  "ADC_DESCRIPTION": "Analog to Digital Converter (ADC) blocks.",
  "ADC_CONFIGURE_MESSAGE0": "configure ADC on pin $[PIN] with attenuation $[ATTEN]",
  "ADC_CONFIGURE_TOOLTIP": "Configure the ADC on the specified pin with the given attenuation"
}
```

### Using Placeholders in Translations

Include input placeholders in your translations using `$[INPUT_NAME]`:

```json
{
  "MOTOR_CONSTRUCTOR_MESSAGE0": "create $[CONSTRUCTED_VAR_NAME] motor with \npins $[PINS]\nLEDC $[LEDC]\nreg params $[REG_PARAMS]\n encoder ticks $[ENC_TICKS] circumference $[CIRCUMFERENCE] (mm)"
}
```

Newlines (`\n`) in translation values create line breaks within the block.

### Translating Labels

Use the `%KEY%` syntax for label text. The translation key is `{CATEGORY}_LABEL_{KEY}`:

**In jacly.json:**

```json
{ "kind": "label", "text": "%SETUP%" }
```

**In translation file:**

```json
{
  "ADC_LABEL_SETUP": "Setup (this is required to use the ADC read block)",
  "ADC_LABEL_READ": "Reading ADC"
}
```

> **Note:** The key inside `%...%` becomes the suffix. For `%SETUP%` in category `adc`, the key is `ADC_LABEL_SETUP`. Labels support long, descriptive translated text — they are section headers in the toolbox.

### Translating Dropdown Options

Use the `%KEY%` syntax for dropdown option labels. The translation key is `{BLOCK_TYPE}_ARGS0_FIELD_DROPDOWN_{KEY}`:

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

### Key Generation Summary

| Source               | Key Pattern                               | Example                                    |
| -------------------- | ----------------------------------------- | ------------------------------------------ |
| Category name        | `{CATEGORY}_NAME`                         | `ADC_NAME`                                 |
| Category description | `{CATEGORY}_DESCRIPTION`                  | `ADC_DESCRIPTION`                          |
| Block message        | `{BLOCK_TYPE}_MESSAGE0`                   | `ADC_CONFIGURE_MESSAGE0`                   |
| Block tooltip        | `{BLOCK_TYPE}_TOOLTIP`                    | `ADC_CONFIGURE_TOOLTIP`                    |
| Label text           | `{CATEGORY}_LABEL_{KEY}`                  | `ADC_LABEL_SETUP`                          |
| Dropdown option      | `{BLOCK_TYPE}_ARGS0_FIELD_DROPDOWN_{KEY}` | `GPIO_PINMODE_ARGS0_FIELD_DROPDOWN_OUTPUT` |
