import React, { Component } from 'react';
import Item from '../Item/Item';

import { CSSTransition, TransitionGroup } from 'react-transition-group';

import './ItemsList.css';

class ItemList extends Component {
  state = {
    items: {}
  };

  addItemHandler = (itemId, itemName) => {
    this.setState({
      items: {
        ...this.state.items,
        [itemId]: itemName
      }
    });
  };

  onDeleteHandler = itemKey => {
    let newStateItems = { ...this.state.items };

    delete newStateItems[itemKey];

    this.setState({
      items: {
        ...newStateItems
      }
    });
  };

  render() {
    const itemsList = Object.keys(this.state.items).map(itemKey => {
      return (
        <CSSTransition key={itemKey} timeout={500} classNames="move">
          <Item
            name={this.state.items[itemKey]}
            onDelete={() => {
              this.onDeleteHandler(itemKey);
            }}
            color={this.props.color}
          />
        </CSSTransition>
      );
    });

    return (
      <div className="items-section">
        <TransitionGroup className="items-section__list">
          {itemsList}
        </TransitionGroup>
      </div>
    );
  }
}

export default ItemList;
