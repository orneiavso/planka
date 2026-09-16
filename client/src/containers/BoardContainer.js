import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import { BoardMembershipRoles } from '../constants/Enums';
import Board from '../components/Board';

const mapStateToProps = (state) => {
  const { cardId } = selectors.selectPath(state);
  const currentUser = selectors.selectCurrentUser(state);
  const currentUserMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
  const listIds = selectors.selectListIdsForCurrentBoard(state);
  const isBoardFrozen = selectors.selectIsBoardFrozen(state);

  const isCurrentUserEditor =
    !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.EDITOR;

  const isAdmin = !!currentUser && currentUser.isAdmin;
  const canArrangeLists = isCurrentUserEditor && isAdmin && !isBoardFrozen;

  return {
    listIds,
    isCardModalOpened: !!cardId,
    canEdit: isCurrentUserEditor,
    canArrangeLists,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onListCreate: entryActions.createListInCurrentBoard,
      onListMove: entryActions.moveList,
      onCardMove: entryActions.moveCard,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Board);
