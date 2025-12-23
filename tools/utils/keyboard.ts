import Keyboard from "simple-keyboard";
import "simple-keyboard/build/css/index.css";

export interface KeyboardOptions {
  keyboardSelector: string;
  targetInputSelectors: string[];
  autoShowOnFocus?: boolean;
  autoHideOnClickOutside?: boolean;
  autoHideOnEnter?: boolean;
}

export class OnScreenKeyboard {
  private keyboard: Keyboard | null = null;
  private currentInput: HTMLInputElement | null = null;
  private keyboardElement: HTMLElement | null = null;
  private targetInputs: HTMLInputElement[] = [];
  private options: Required<KeyboardOptions>;

  constructor(options: KeyboardOptions) {
    this.options = {
      autoShowOnFocus: true,
      autoHideOnClickOutside: true,
      autoHideOnEnter: true,
      ...options,
    };
  }

  /**
   * Initialize the keyboard with the given options
   */
  async init(): Promise<void> {
    // Check if keyboard is enabled in config
    const config = await window.configAPI.getConfig();
    if (!config.useOnScreenKeyboard) {
      console.log("Onscreen keyboard is disabled in config");
      return;
    }

    // Find keyboard container
    this.keyboardElement = document.querySelector(this.options.keyboardSelector);
    if (!this.keyboardElement) {
      console.error("Keyboard container element not found:", this.options.keyboardSelector);
      return;
    }

    // Initialize keyboard
    this.keyboard = new Keyboard(this.keyboardElement, {
      onChange: (input) => this.handleChange(input),
      onKeyPress: (button) => this.handleKeyPress(button),
      theme: "hg-theme-default hg-layout-default",
      layout: {
        default: [
          "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
          "{tab} q w e r t y u i o p [ ] \\",
          "{lock} a s d f g h j k l ; ' {enter}",
          "{shift} z x c v b n m , . / {shift}",
          ".com @ {space}"
        ],
        shift: [
          "~ ! @ # $ % ^ & * ( ) _ + {bksp}",
          "{tab} Q W E R T Y U I O P { } |",
          '{lock} A S D F G H J K L : " {enter}',
          "{shift} Z X C V B N M < > ? {shift}",
          ".com @ {space}"
        ]
      },
      display: {
        "{bksp}": "⌫ backspace",
        "{enter}": "↵ enter",
        "{shift}": "⇧ shift",
        "{lock}": "⇪ caps",
        "{tab}": "⇥ tab",
        "{space}": "space"
      }
    });

    // Setup target inputs
    this.setupTargetInputs();

    // Setup auto-hide on click outside
    if (this.options.autoHideOnClickOutside) {
      this.setupClickOutsideHandler();
    }

    console.log("Onscreen keyboard initialized successfully");
  }

  /**
   * Setup event listeners for target input fields
   */
  private setupTargetInputs(): void {
    this.targetInputs = [];

    this.options.targetInputSelectors.forEach((selector) => {
      const elements = document.querySelectorAll<HTMLInputElement>(selector);
      elements.forEach((input) => {
        this.targetInputs.push(input);

        if (this.options.autoShowOnFocus) {
          input.addEventListener("focus", () => {
            this.showKeyboard(input);
          });
        }
      });
    });
  }

  /**
   * Show the keyboard for a specific input
   */
  showKeyboard(input: HTMLInputElement): void {
    this.currentInput = input;

    // Find the keyboard container parent
    const container = this.keyboardElement?.closest('.keyboard-container');
    if (container) {
      container.classList.add("active");
    }

    if (this.keyboard) {
      this.keyboard.setInput(input.value);
    }
  }

  /**
   * Hide the keyboard
   */
  hideKeyboard(): void {
    const container = this.keyboardElement?.closest('.keyboard-container');
    if (container) {
      container.classList.remove("active");
    }
    this.currentInput = null;
  }

  /**
   * Handle keyboard input change
   */
  private handleChange(input: string): void {
    if (this.currentInput) {
      this.currentInput.value = input;
      this.currentInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  /**
   * Handle key press
   */
  private handleKeyPress(button: string): void {
    console.log("Button pressed:", button);

    // Handle shift
    if (button === "{shift}" || button === "{lock}") {
      this.handleShift();
    }

    // Handle enter - close keyboard
    if (button === "{enter}" && this.options.autoHideOnEnter) {
      this.hideKeyboard();
      if (this.currentInput) {
        this.currentInput.blur();
      }
    }
  }

  /**
   * Handle shift key toggle
   */
  private handleShift(): void {
    if (!this.keyboard) return;

    const currentLayout = this.keyboard.options.layoutName;
    const shiftToggle = currentLayout === "default" ? "shift" : "default";

    this.keyboard.setOptions({
      layoutName: shiftToggle
    });
  }

  /**
   * Setup click outside handler
   */
  private setupClickOutsideHandler(): void {
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;

      // Check if click is on a target input or keyboard
      const isTargetInput = this.targetInputs.some(input => input.contains(target));
      const isKeyboard = this.keyboardElement?.contains(target) ||
                        this.keyboardElement?.closest('.keyboard-container')?.contains(target);

      if (!isTargetInput && !isKeyboard) {
        this.hideKeyboard();
      }
    });
  }

  /**
   * Destroy the keyboard and clean up
   */
  destroy(): void {
    if (this.keyboard) {
      this.keyboard.destroy();
      this.keyboard = null;
    }
    this.targetInputs = [];
    this.currentInput = null;
  }
}

/**
 * Initialize keyboard helper function
 */
export async function initKeyboard(
  keyboardSelector: string,
  ...targetInputSelectors: string[]
): Promise<OnScreenKeyboard> {
  const keyboard = new OnScreenKeyboard({
    keyboardSelector,
    targetInputSelectors,
  });

  await keyboard.init();
  return keyboard;
}
