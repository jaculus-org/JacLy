import * as Blockly from 'blockly/core';
import * as LucideIcons from 'lucide-static';

type CategoryDefWithIcon = Blockly.utils.toolbox.CategoryInfo & {
  icon?: string;
};

const lucideIconsMap = LucideIcons as Record<string, string>;

export class JaclyCustomCategory extends Blockly.ToolboxCategory {
  protected iconDom_: HTMLElement | null = null;

  constructor(
    categoryDef: Blockly.utils.toolbox.CategoryInfo,
    toolbox: Blockly.IToolbox,
    opt_parent?: Blockly.ICollapsibleToolboxItem
  ) {
    super(categoryDef, toolbox, opt_parent);
  }

  // Update category border color, also store it as CSS variable for styling
  protected addColourBorder_(colour: string): void {
    super.addColourBorder_(colour);
    if (this.rowDiv_) {
      this.rowDiv_.style.setProperty('--category-color', colour);
    }
  }

  // Build the icon DOM element - use lucide icons if specified, fallback to box
  protected createIconDom_(): HTMLElement {
    const iconContainer = document.createElement('div');
    iconContainer.classList.add('jaclyToolboxCategoryIcon');

    const iconName = (this.toolboxItemDef_ as CategoryDefWithIcon).icon;

    if (iconName && iconName in lucideIconsMap) {
      const iconSvg = lucideIconsMap[iconName];
      iconContainer.innerHTML = iconSvg;

      const svgElement = iconContainer.querySelector('svg');
      if (svgElement) {
        svgElement.setAttribute('width', '16');
        svgElement.setAttribute('height', '16');
        svgElement.style.color = 'currentColor';
      }
    } else {
      iconContainer.innerHTML = LucideIcons.Box;
      const svgElement = iconContainer.querySelector('svg');
      if (svgElement) {
        svgElement.setAttribute('width', '16');
        svgElement.setAttribute('height', '16');
        svgElement.style.color = 'currentColor';
      }
    }

    this.iconDom_ = iconContainer;
    return iconContainer;
  }
}

// Register this as the default toolbox category in Blockly
export function registerJaclyCustomCategory(): void {
  Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX_ITEM,
    Blockly.ToolboxCategory.registrationName,
    JaclyCustomCategory,
    true
  );
}
