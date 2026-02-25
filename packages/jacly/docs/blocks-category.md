# Blocks category

Each toolbox category in JacLy is defined using a single JSON file (`*.jacly.json`). Block definitions are distributed in Jaculus libraries — each library can define multiple categories.

The category definition files are located in the `blocks/` folder of each library.

## Category Definition

```json
{
  "version": "0.1.0",
  "author": "Jakub Andrysek",
  "github": "JakubAndrysek",
  "license": "MIT",

  "category": "keyvalue",
  "name": "%T%",
  "description": "%T%",
  "docs": "/docs/blocks/keyvalue",
  "colour": "#751F5C",
  "icon": "Key",
  "priority": 120,
  "libraries": ["import * as keyvalue from \"keyvalue\";"],
  "contents": []
}
```

## Properties Reference

| Property         | Type     | Required | Description                                                                                        |
| ---------------- | -------- | -------- | -------------------------------------------------------------------------------------------------- |
| `version`        | string   | ✅       | Semantic version (e.g. `"0.1.0"`)                                                                  |
| `author`         | string   | ✅       | Author name                                                                                        |
| `github`         | string   |          | GitHub username                                                                                    |
| `license`        | string   | ✅       | License identifier (e.g. `"MIT"`)                                                                  |
| `category`       | string   | ✅       | Unique category identifier (lowercase, used for translation keys)                                  |
| `parentCategory` | string   |          | Parent category identifier for subcategories                                                       |
| `name`           | string   | ✅       | Display name in toolbox (use `%T%` for translation → `{CATEGORY}_NAME`)                            |
| `description`    | string   |          | Category description (use `%T%` for translation → `{CATEGORY}_DESCRIPTION`)                        |
| `docs`           | string   |          | URL path to documentation page                                                                     |
| `colour`         | string   |          | Hex color (e.g. `"#751F5C"`) or hue (0–360). Applied to all blocks in category                     |
| `icon`           | string   |          | Icon name from [Lucide Icons](https://lucide.dev/icons/)                                           |
| `priority`       | number   |          | Ordering in the toolbox — lower numbers appear first                                               |
| `libraries`      | string[] |          | Import statements added to generated code when blocks from this category are used                  |
| `contents`       | array    |          | Array of block definitions, labels, and separators (see [Block definition](./block-definition.md)) |

## Contents Array

The `contents` array can contain items of different kinds:

### Blocks (`kind: "block"`)

Full block definitions or usage-only references. See [Block definition](./block-definition.md) for details.

```json
{ "kind": "block", "type": "adc_configure", "message0": "...", ... }
```

### Labels (`kind: "label"`)

Text labels that visually separate sections in the toolbox:

```json
{ "kind": "label", "text": "%SETUP%" }
```

Use `%KEY%` for translatable text → translation key is `{CATEGORY}_LABEL_{KEY}`.

### Separators (`kind: "separator"`)

Visual gap between blocks:

```json
{ "kind": "separator", "gap": 8 }
```

## Examples

### Simple Category (ADC)

```json
{
  "category": "adc",
  "name": "%T%",
  "description": "%T%",
  "colour": "#9C27B0",
  "icon": "AudioWaveform",
  "priority": 105,
  "libraries": ["import * as adc from \"adc\";"],
  "contents": [
    { "kind": "label", "text": "%SETUP%" },
    { "kind": "block", "type": "adc_configure", ... },
    { "kind": "label", "text": "%READ%" },
    { "kind": "block", "type": "adc_read", ... }
  ]
}
```

### Category with Virtual Instances (Robutek)

A category that defines its own constructor and exposes blocks from other categories:

```json
{
  "category": "robutek2",
  "name": "%T%",
  "colour": "#b08DA5",
  "icon": "Bot",
  "libraries": ["import { createRobutek } from \"robutek\";"],
  "contents": [
    {
      "kind": "block",
      "type": "robutek2_constructor",
      "constructs": "robutek2",
      "virtualInstances": [
        { "instanceof": "differential_drive", "name": "r_differential", "connection": "$[CONSTRUCTED_VAR_NAME]." },
        { "instanceof": "motor", "name": "leftMotor", "connection": "$[CONSTRUCTED_VAR_NAME].leftMotor" },
        { "instanceof": "motor", "name": "rightMotor", "connection": "$[CONSTRUCTED_VAR_NAME].rightMotor" }
      ],
      ...
    },
    { "kind": "label", "text": "%MOVEMENT%" },
    { "kind": "block", "type": "differential_drive_move" },
    { "kind": "block", "type": "differential_drive_rotate" },
    { "kind": "block", "type": "differential_drive_stop" }
  ]
}
```

This pattern lets the robutek toolbox include blocks from `differential_drive` and `motor` categories, with the virtual instances automatically appearing in their dropdown selectors.
