import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  ICommandPalette,
  WidgetTracker,
  MainAreaWidget
} from '@jupyterlab/apputils';

import { ILauncher } from '@jupyterlab/launcher';

import { IMainMenu } from '@jupyterlab/mainmenu';

import { ITranslator } from '@jupyterlab/translation';

import { IRenderMimeRegistry } from '@jupyterlab/rendermime';

import { Menu } from '@lumino/widgets';

import { ExamplePanel } from './panel';

/**
 * The command IDs used by the console plugin.
 */
namespace CommandIDs {
  export const create = 'kernel-output:create';
}

/**
 * Initialization data for the node_editor extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'node_editor:plugin',
  autoStart: true,
  optional: [ILauncher],
  requires: [
    ICommandPalette,
    IMainMenu,
    IRenderMimeRegistry,
    ITranslator,
    ILayoutRestorer
  ],
  activate: activate
};

/**
 * Activate the JupyterLab extension.
 *
 * @param app Jupyter Front End
 * @param palette Jupyter Commands Palette
 * @param mainMenu Jupyter Menu
 * @param rendermime Jupyter Render Mime Registry
 * @param translator Jupyter Translator
 * @param launcher [optional] Jupyter Launcher
 */
function activate(
  app: JupyterFrontEnd,
  palette: ICommandPalette,
  mainMenu: IMainMenu,
  rendermime: IRenderMimeRegistry,
  translator: ITranslator,
  restorer: ILayoutRestorer,
  launcher: ILauncher | null
): void {
  console.log('JupyterLab extension node_editor is activated!');

  const manager = app.serviceManager;
  const { commands, shell } = app;
  const category = 'Extension Examples';
  const trans = translator.load('jupyterlab');
  let widget: MainAreaWidget<ExamplePanel>;

  /**
   * Creates a example panel.
   *
   * @returns The panel
   */
  function createPanel(): void {
    if (!widget || widget.isDisposed) {
      const content = new ExamplePanel(
        manager,
        rendermime,
        commands,
        translator
      );
      widget = new MainAreaWidget({ content });
      widget.id = 'node_editor';
      widget.title.label = 'Node Editor';
      widget.title.closable = true;
    }
    if (!tracker.has(widget)) {
      // Track the state of the widget for later restoration
      tracker.add(widget);
    }
    if (!widget.isAttached) {
      // Attach the widget to the main work area if it's not there
      app.shell.add(widget, 'main');
    }
    widget.content.update();

    // Activate the widget
    shell.activateById(widget.id);
  }

  // add menu tab
  const exampleMenu = new Menu({ commands });
  exampleMenu.title.label = trans.__('Kernel Output');
  mainMenu.addMenu(exampleMenu);

  // add commands to registry
  commands.addCommand(CommandIDs.create, {
    label: trans.__('Open the Node Editor Panel'),
    caption: trans.__('Open the Node Editor Panel'),
    execute: createPanel
  });

  // add items in command palette and menu
  [CommandIDs.create].forEach(command => {
    palette.addItem({ command, category });
    exampleMenu.addItem({ command });
  });

  // Add launcher
  if (launcher) {
    launcher.add({
      command: CommandIDs.create,
      category: category
    });
  }

  const tracker = new WidgetTracker<MainAreaWidget<ExamplePanel>>({
    namespace: 'node_editor'
  });
  restorer.restore(tracker, {
    command: CommandIDs.create,
    name: () => 'node_editor'
  });
}

export default extension;
