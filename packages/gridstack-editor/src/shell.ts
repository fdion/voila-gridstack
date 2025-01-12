import { JupyterFrontEnd } from '@jupyterlab/application';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import { classes, DockPanelSvg, LabIcon } from '@jupyterlab/ui-components';

import { IIterator, iter, toArray } from '@lumino/algorithm';

import { Widget, BoxLayout } from '@lumino/widgets';

export type IShell = Shell;

/**
 * A namespace for Shell statics
 */
export namespace IShell {
  /**
   * The areas of the application shell where widgets can reside.
   */
  export type Area = 'main';
}

/**
 * The application shell.
 */
export class Shell extends Widget implements JupyterFrontEnd.IShell {
  constructor() {
    super();
    this.id = 'main';

    const rootLayout = new BoxLayout();

    this._main = new DockPanelSvg();
    this._main.id = 'main-panel';

    BoxLayout.setStretch(this._main, 1);

    this._main.spacing = 5;

    rootLayout.spacing = 0;
    rootLayout.addWidget(this._main);

    this.layout = rootLayout;
  }

  activateById(id: string): void {
    // no-op
  }

  /**
   * Add a widget to the application shell.
   *
   * @param widget - The widget being added.
   *
   * @param area - Optional region in the shell into which the widget should
   * be added.
   *
   */
  add(
    widget: Widget,
    area?: IShell.Area,
    options?: DocumentRegistry.IOpenOptions
  ): void {
    if (area !== 'main') {
      return;
    }
    return this._addToMainArea(widget, options);
  }

  /**
   * The current widget in the shell's main area.
   */
  get currentWidget(): Widget {
    // TODO: use a focus tracker to return the current widget
    return toArray(this._main.widgets())[0];
  }

  widgets(area: IShell.Area): IIterator<Widget> {
    if (area !== 'main') {
      return iter([]);
    }
    return this._main.widgets();
  }

  /**
   * Add a widget to the main content area.
   *
   * @param widget The widget to add.
   */
  private _addToMainArea(
    widget: Widget,
    options?: DocumentRegistry.IOpenOptions
  ): void {
    if (!widget.id) {
      console.error(
        'Widgets added to the app shell must have unique id property.'
      );
      return;
    }

    const dock = this._main;

    const { title } = widget;
    title.dataset = { ...title.dataset, id: widget.id };

    if (title.icon instanceof LabIcon) {
      // bind an appropriate style to the icon
      title.icon = title.icon.bindprops({
        stylesheet: 'mainAreaTab',
      });
    } else if (typeof title.icon === 'string' || !title.icon) {
      // add some classes to help with displaying css background imgs
      title.iconClass = classes(title.iconClass, 'jp-Icon');
    }

    const mode = options?.mode ?? 'tab-after';
    dock.addWidget(widget, { mode });
    dock.activateWidget(widget);
  }

  private _main: DockPanelSvg;
}
