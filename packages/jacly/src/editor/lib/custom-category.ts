import * as Blockly from 'blockly/core';
import * as LucideIcons from 'lucide-static';

export class JaclyCustomCategory extends Blockly.ToolboxCategory {
  protected iconDom_: HTMLElement | null = null;

  constructor(
    categoryDef: Blockly.utils.toolbox.CategoryInfo,
    toolbox: Blockly.IToolbox,
    opt_parent?: Blockly.ICollapsibleToolboxItem
  ) {
    super(categoryDef, toolbox, opt_parent);
  }

  /**
   * Adds the colour to the toolbox.
   * This is called on category creation and whenever the theme changes.
   * @override
   */
  protected addColourBorder_(colour: string): void {
    if (this.rowDiv_) {
      // Store the category color as a custom property for potential use
      this.rowDiv_.style.setProperty('--category-color', colour);
    }
  }

  /**
   * Sets the style for the category when it is selected or deselected.
   * @param {boolean} isSelected True if the category has been selected,
   *     false otherwise.
   * @override
   */
  setSelected(isSelected: boolean): void {
    if (!this.rowDiv_) return;

    // CSS handles the visual state via aria-selected attribute
    // No need to manually set colors - they're controlled by CSS variables

    // This is used for accessibility purposes.
    Blockly.utils.aria.setState(
      this.htmlDiv_ as Element,
      Blockly.utils.aria.State.SELECTED,
      isSelected
    );
  }

  /**
   * Creates the dom used for the icon.
   * @returns {HTMLElement} The element for the icon.
   * @override
   */
  protected createIconDom_(): HTMLElement {
    const iconContainer = document.createElement('div');
    iconContainer.classList.add('jaclyToolboxCategoryIcon');

    // Get icon name from toolbox definition
    const iconName = (this.toolboxItemDef_ as any).icon;

    if (iconName && iconName in LucideIcons) {
      // Get the SVG string from lucide-static
      const iconSvg = (LucideIcons as any)[iconName];
      iconContainer.innerHTML = iconSvg;

      // Style the SVG - smaller size for inline display
      const svgElement = iconContainer.querySelector('svg');
      if (svgElement) {
        svgElement.setAttribute('width', '16');
        svgElement.setAttribute('height', '16');
        svgElement.style.color = 'currentColor';
      }
    } else {
      // Default icon if none specified or not found
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

/**
 * Register the custom category with Blockly
 */
export function registerJaclyCustomCategory(): void {
  Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX_ITEM,
    Blockly.ToolboxCategory.registrationName,
    JaclyCustomCategory,
    true
  );
}
