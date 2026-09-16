import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import actions from '../actions';
import entryActions from '../entry-actions';
import Header from '../components/Header';

const mapStateToProps = (state) => {
  const isLogouting = selectors.selectIsLogouting(state);
  const currentUser = selectors.selectCurrentUser(state);
  const currentProject = selectors.selectCurrentProject(state);
  const notifications = selectors.selectNotificationsForCurrentUser(state);
  const isCurrentUserManager = selectors.selectIsCurrentUserManagerForCurrentProject(state);
  const isBoardFrozen = selectors.selectIsBoardFrozen(state);
  const projectBoards = currentProject ? selectors.selectBoardsForCurrentProject(state) : [];
  const hasProjectBoards = projectBoards.length > 0;
  const { boardId: currentBoardId } = selectors.selectPath(state);
  const currentBoardListIds = currentBoardId
    ? selectors.selectListIdsForCurrentBoard(state)
    : null;
  const hasEmptyCurrentBoard = currentBoardListIds !== null && currentBoardListIds.length === 0;
  const shouldAutoUnlock =
    isBoardFrozen && !!currentProject && (!hasProjectBoards || hasEmptyCurrentBoard);

  return {
    notifications,
    isLogouting,
    project: currentProject,
    user: currentUser,
    canEditProject: isCurrentUserManager && !isBoardFrozen,
    canEditUsers: currentUser.isAdmin,
    isBoardFrozen,
    canToggleBoardFreeze: currentUser.isAdmin && !!currentProject,
    shouldAutoUnlock,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onProjectSettingsClick: entryActions.openProjectSettingsModal,
      onUsersClick: entryActions.openUsersModal,
      onNotificationDelete: entryActions.deleteNotification,
      onUserSettingsClick: entryActions.openUserSettingsModal,
      onLogout: entryActions.logout,
      onToggleBoardFreeze: actions.toggleBoardFreeze,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Header);
