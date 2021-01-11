import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ICommandPalette } from '@jupyterlab/apputils';

import { ILauncher } from '@jupyterlab/launcher';

import { IMainMenu } from '@jupyterlab/mainmenu';

import { ITranslator } from '@jupyterlab/translation';

import { IRenderMimeRegistry } from '@jupyterlab/rendermime';

import { Menu } from '@lumino/widgets';

import { ExamplePanel } from './panel';

import { requestAPI } from './handler';

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
  requires: [ICommandPalette, IMainMenu, IRenderMimeRegistry, ITranslator],
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
  launcher: ILauncher | null
): void {
  console.log('JupyterLab extension node_editor is activated!');

  const manager = app.serviceManager;
  const { commands, shell } = app;
  const category = 'Extension Examples';
  const trans = translator.load('jupyterlab');
  let panel: ExamplePanel;

  /**
   * Creates a example panel.
   *
   * @returns The panel
   */
  async function createPanel(): Promise<ExamplePanel> {
    panel = new ExamplePanel(manager, rendermime, commands, translator);
    shell.add(panel, 'main');
    return panel;
  }

  // add menu tab
  const exampleMenu = new Menu({ commands });
  exampleMenu.title.label = trans.__('Kernel Output');
  mainMenu.addMenu(exampleMenu);

  // add commands to registry
  commands.addCommand(CommandIDs.create, {
    label: trans.__('Open the Kernel Output Panel'),
    caption: trans.__('Open the Kernel Output Panel'),
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

  // Request something simple on the API
  requestAPI<any>('get_example')
    .then(data => {
      console.log(data);
    })
    .catch(reason => {
      console.error(
        `The node_editor server extension appears to be missing.\n${reason}`
      );
    });
}

export default extension;
