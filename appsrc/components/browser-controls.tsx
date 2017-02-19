
import listensToClickOutside = require("react-onclickoutside");
import * as React from "react";
import {connect} from "./connect";
import * as classNames from "classnames";

import * as actions from "../actions";

import {ITabData} from "../types";
import {ILocalizer} from "../localizer";
import {IDispatch, dispatcher} from "../constants/action-types";

import watching, {Watcher} from "./watching";

import Ink = require("react-ink");

function isHTMLInput (el: HTMLElement): el is HTMLInputElement {
  return el.tagName === "INPUT";
}

@watching
export class BrowserControls extends React.Component<IBrowserControlsProps, IBrowserControlsState> {
  browserAddress: HTMLInputElement | HTMLElement;

  constructor () {
    super();
    this.state = {
      editingURL: false,
    };

    this.startEditingURL = this.startEditingURL.bind(this);
    this.addressKeyUp = this.addressKeyUp.bind(this);
    this.addressBlur = this.addressBlur.bind(this);
    this.onBrowserAddress = this.onBrowserAddress.bind(this);
    this.popOutBrowser = this.popOutBrowser.bind(this);
  }

  subscribe (watcher: Watcher) {
    watcher.on(actions.triggerLocation, async (store, action) => {
      if (!this.props.active) {
        return;
      }

      const {browserAddress} = this;
      if (!browserAddress) {
        return;
      }

      if (isHTMLInput(browserAddress)) {
        // already editing url, just select existing text
        browserAddress.focus();
        browserAddress.select();
      } else {
        // not editing url yet, no time like the present
        this.startEditingURL();
      }
    });

    watcher.on(actions.triggerBack, async (store, action) => {
      if (!this.props.active) {
        return;
      }

      const {browserAddress} = this;
      if (!browserAddress) {
        return;
      }

      browserAddress.blur();
    });
  }

  render () {
    const {editingURL} = this.state;
    const {t, browserState} = this.props;
    const {canGoBack, canGoForward, loading, url = ""} = browserState;
    const {goBack, goForward, stop, reload, frozen} = this.props;

    const addressClasses = classNames("browser-address", {frozen, visible: (!!url && !!url.length)});

    return <div className="browser-controls">
      <span className={classNames("icon icon-arrow-left", {disabled: !canGoBack})} onClick={() => goBack()}>
        <Ink/>
      </span>
      <span className={classNames("icon icon-arrow-right", {disabled: !canGoForward})} onClick={() => goForward()}>
        <Ink/>
      </span>
      {
        loading
        ? <span className="icon icon-cross loading" onClick={() => stop()}>
            <Ink/>
          </span>
        : <span className="icon icon-repeat" onClick={() => reload()}>
            <Ink/>
          </span>
      }
      {editingURL
        ? <input type="text" disabled={frozen} ref={this.onBrowserAddress}
            className="browser-address editing visible" defaultValue={url}
            onKeyUp={this.addressKeyUp} onBlur={this.addressBlur}/>
        : <span className={addressClasses} ref={this.onBrowserAddress} onClick={() =>
            (url && url.length) && this.startEditingURL()
          }>{url || ""}</span>
      }
      <span
          data-rh-at="right"
          data-rh={t("browser.popout")}
          className={classNames("icon icon-redo")} onClick={() => this.popOutBrowser()}>
        <Ink/>
      </span>
    </div>;
  }

  popOutBrowser () {
    this.props.openUrl({url: this.props.browserState.url});
  }

  startEditingURL () {
    if (this.props.frozen) {
      return;
    }
    this.setState({editingURL: true});
  }

  onBrowserAddress (browserAddress: HTMLElement | HTMLInputElement) {
    this.browserAddress = browserAddress;

    if (!browserAddress) {
      return;
    }

    if (isHTMLInput(browserAddress)) {
      browserAddress.focus();
      browserAddress.select();
    }
  }

  addressKeyUp (e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const url = e.currentTarget.value;
      this.setState({editingURL: false});
      this.props.loadURL(url);
    }
    if (e.key === "Escape") {
      this.setState({editingURL: false});
    }
  }

  addressBlur () {
    this.setState({editingURL: false});
  }

  handleClickOutside () {
    this.setState({editingURL: false});
  }
}

interface IBrowserControlsProps {
  browserState: {
    url: string;
    loading: boolean;
    canGoBack: boolean;
    canGoForward: boolean;
  };

  active: boolean;
  tabPath: string;
  tabData: ITabData;
  frozen: boolean;

  t: ILocalizer;

  /** open URL in external browser */
  openUrl: typeof actions.openUrl;

  goBack: () => void;
  goForward: () => void;
  stop: () => void;
  reload: () => void;
  loadURL: (url: string) => void;
}

interface IBrowserControlsState {
  editingURL: boolean;
}

const mapStateToProps = () => ({});
const mapDispatchToProps = (dispatch: IDispatch) => ({
  openUrl: dispatcher(dispatch, actions.openUrl),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(listensToClickOutside(BrowserControls));
