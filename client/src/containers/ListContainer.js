import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import { BoardMembershipRoles } from '../constants/Enums';
import List from '../components/List';

const makeMapStateToProps = () => {
  const selectListById = selectors.makeSelectListById();
  const selectCardIdsByListId = selectors.makeSelectCardIdsByListId();

  return (state, { id, index }) => {
    const { name, color, isPersisted } = selectListById(state, id);
    const cardIds = selectCardIdsByListId(state, id);
    const currentUser = selectors.selectCurrentUser(state);
    const currentUserMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
    const isBoardFrozen = selectors.selectIsBoardFrozen(state);

    const isCurrentUserEditor =
      !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.EDITOR;

    const isAdmin = !!currentUser && currentUser.isAdmin;
    const canArrangeLists = isCurrentUserEditor && isAdmin && !isBoardFrozen;

    return {
      id,
      index,
      name,
      color,
      isPersisted,
      cardIds,
      canEdit: isCurrentUserEditor,
      canArrangeLists,
    };
  };
};

const mapDispatchToProps = (dispatch, { id }) =>
  bindActionCreators(
    {
      onUpdate: (data) => entryActions.updateList(id, data),
      onSort: (data) => entryActions.sortList(id, data),
      onDelete: () => entryActions.deleteList(id),
      onCardCreate: (data, autoOpen) => entryActions.createCard(id, data, autoOpen),
    },
    dispatch,
  );

export default connect(makeMapStateToProps, mapDispatchToProps)(List);
