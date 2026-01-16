# Blocks category

Each toolbox category in Jacly is defined using single JSON file.
Block definitions are distributed in Jaculus libraries, each library can define multiple categories and subcategories.

The category definition files are located in the `blocks` folder of each library.

```json
{
  "version": "1.0.0",
  "author": "Jakub Andrysek",
  "github": "https://github.com/JakubAndrysek",
  "license": "MIT",

  "category": "keyvalue",
  "name": "Key Value Storage",
  "description": "Blocks for storing and retrieving key-value pairs.",
  "docs": "/docs/blocks/keyvalue",
  "colour": "#751F5C", // (hex color) colour of the category in the toolbox
  "icon": "Key", // https://lucide.dev/icons/
  "priority": 120, // (number) determines the order of categories in the toolbox, lower numbers appear first
  "libraries": [ // (string array) list of Jacly libraries to import for this category
    "import * as keyvalue from \"keyvalue\";"
  ],
  "contents": []
}```
