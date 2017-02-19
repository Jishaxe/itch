
import * as React from "react";
import {createStructuredSelector} from "reselect";

import {connect} from "./connect";

import {map, each, filter} from "underscore";

import doesEventMeanBackground from "./does-event-mean-background";

import * as actions from "../actions";

import {ILocalizer} from "../localizer";

import Icon from "./icon";
import NiceAgo from "./nice-ago";
import Ink = require("react-ink");
import interleave from "./interleave";

import {IState, ICollectionRecord, IGameRecordSet, IUserMarketState} from "../types";
import {IDispatch, dispatcher} from "../constants/action-types";

export class CollectionHubItem extends React.Component<ICollectionHubItemProps, void> {
  render () {
    const {t, allGames, collection} = this.props;
    const {navigateToCollection} = this.props;
    const {title} = collection;

    const gameIds = (collection.gameIds || []).slice(0, 8);
    const games = filter(map(gameIds, (gameId) => allGames[gameId]), (x) => !!x);

    const gameItems = map(games, (game, index) => {
      const style: React.CSSProperties = {};
      const coverUrl = game.stillCoverUrl || game.coverUrl;
      if (coverUrl) {
        style.backgroundImage = `url('${coverUrl}')`;
      }
      return <div key={index} className="cover" style={style}></div>;
    });

    const cols: JSX.Element[] = [];
    each(gameItems, (item, i) => {
      cols.push(item);
    });

    const itemCount = (collection.gameIds || []).length;

    return <div className="hub-item collection-hub-item"
        onClick={(e) => navigateToCollection(collection, doesEventMeanBackground(e))}>
      <section className="title">
        {title}
      </section>
      <section className="fresco">
        {cols}
      </section>
      <section className="info">
        <Icon icon="tag"/>
        <span className="total">{t("sidebar.collection.subtitle", {itemCount})}</span>
        <span className="spacer"/>
        <Icon icon="history"/>
        {interleave(t, "collection_grid.item.updated_at", {
          time_ago: <NiceAgo date={collection.updatedAt}/>,
        })}
      </section>
      <Ink/>
    </div>;
  }
}

interface ICollectionHubItemProps {
  // specified
  collection: ICollectionRecord;

  // derived
  allGames: IGameRecordSet;

  navigateToCollection: typeof actions.navigateToCollection;

  t: ILocalizer;
}

const mapStateToProps = createStructuredSelector({
  allGames: (state: IState) => (state.market || {} as IUserMarketState).games || {},
});

const mapDispatchToProps = (dispatch: IDispatch) => ({
  navigateToCollection: dispatcher(dispatch, actions.navigateToCollection),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CollectionHubItem);
