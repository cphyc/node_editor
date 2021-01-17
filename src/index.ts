import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';

import {
  ICommandPalette,
  WidgetTracker,
  MainAreaWidget,
} from '@jupyterlab/apputils';

import { ILauncher } from '@jupyterlab/launcher';

import { IMainMenu } from '@jupyterlab/mainmenu';

import { ITranslator } from '@jupyterlab/translation';

import { IRenderMimeRegistry } from '@jupyterlab/rendermime';

import { ICompletionManager } from '@jupyterlab/completer';

import { Menu } from '@lumino/widgets';

import { MyPublicAPI, GraphWindow } from './mime';

import { IMyManager, MyManager } from './manager';

/**
 * The command IDs used by the console plugin.
 */
namespace CommandIDs {
  export const create = 'kernel-output:create';
}

/**
 * Initialization data for the node_editor extension.
 */
const extension: JupyterFrontEndPlugin<IMyManager> = {
  id: 'node_editor:plugin',
  autoStart: true,
  provides: IMyManager,
  optional: [ILauncher],
  requires: [
    ICommandPalette,
    IMainMenu,
    IRenderMimeRegistry,
    ITranslator,
    ILayoutRestorer,
    ICompletionManager,
  ],
  activate,
};

/**
 * Activate the JupyterLab extension.
 *
 * @param app Jupyter Front End
 * @param palette Jupyter Commands Palette
 * @param mainMenu Jupyter Menu
 * @param rendermime Jupyter Render Mime Registry
 * @param translator Jupyter Translator
 * @param restorer Jupyter Restorer
 * @param restorer Jupyter Completion Manager
 * @param launcher [optional] Jupyter Launcher
 */
function activate(
  app: JupyterFrontEnd,
  palette: ICommandPalette,
  mainMenu: IMainMenu,
  rendermime: IRenderMimeRegistry,
  translator: ITranslator,
  restorer: ILayoutRestorer,
  completionManager: ICompletionManager,
  launcher: ILauncher | null
): IMyManager {
  console.log('JupyterLab extension node_editor is activated!');

  const manager = app.serviceManager;
  const { commands } = app;
  const category = 'Extension Examples';
  const trans = translator.load('jupyterlab');
  // let widget: MainAreaWidget<GraphWindow>;
  const mgr = new MyManager(manager, rendermime, completionManager);
  MyPublicAPI.manager = mgr;
  /**
   * Creates a example panel.
   *
   * @returns The panel
   */
  function createGraph(): void {
    console.debug('Not implementer yet');
  }

  // add menu tab
  const exampleMenu = new Menu({ commands });
  exampleMenu.title.label = trans.__('Kernel Output');
  mainMenu.addMenu(exampleMenu);

  // add commands to registry
  commands.addCommand(CommandIDs.create, {
    label: trans.__('Open the Node Editor Panel'),
    caption: trans.__('Open the Node Editor Panel'),
    execute: createGraph,
  });

  // add items in command palette and menu
  [CommandIDs.create].forEach((command) => {
    palette.addItem({ command, category });
    exampleMenu.addItem({ command });
  });

  // Add launcher
  if (launcher) {
    launcher.add({
      command: CommandIDs.create,
      category,
    });
  }

  const tracker = new WidgetTracker<MainAreaWidget<GraphWindow>>({
    namespace: 'node_editor',
  });

  restorer.restore(tracker, {
    command: CommandIDs.create,
    name: () => 'node_editor',
  });

  return MyPublicAPI.manager;
}

export default extension;
