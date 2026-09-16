import { LOCATION_CHANGE_HANDLE } from '../lib/redux-router';

import ActionTypes from '../constants/ActionTypes';
import ModalTypes from '../constants/ModalTypes';

const BOARD_FREEZE_STORAGE_KEY = 'plankaBoardFrozen';

const readInitialBoardFrozen = () => {
  try {
    const stored = window.localStorage.getItem(BOARD_FREEZE_STORAGE_KEY);
    if (stored === null) {
      return false;
    }
    return stored === '1';
  } catch (e) {
    return false;
  }
};

const initialState = {
  isLogouting: false,
  currentModal: null,
  isBoardFrozen: readInitialBoardFrozen(),
};

// eslint-disable-next-line default-param-last
export default (state = initialState, { type, payload }) => {
  switch (type) {
    case LOCATION_CHANGE_HANDLE:
    case ActionTypes.MODAL_CLOSE:
      return {
        ...state,
        currentModal: null,
      };
    case ActionTypes.BOARD_FREEZE_TOGGLE:
      try {
        window.localStorage.setItem(BOARD_FREEZE_STORAGE_KEY, payload.isFrozen ? '1' : '0');
      } catch (e) {
        // ignore storage errors
      }
      return {
        ...state,
        isBoardFrozen: payload.isFrozen,
      };
    case ActionTypes.LOGOUT__ACCESS_TOKEN_INVALIDATE:
      return {
        ...state,
        isLogouting: true,
      };
    case ActionTypes.MODAL_OPEN:
      return {
        ...state,
        currentModal: payload.type,
      };
    case ActionTypes.USER_UPDATE_HANDLE:
      if (state.currentModal === ModalTypes.USERS && payload.isCurrent && !payload.user.isAdmin) {
        return {
          ...state,
          currentModal: null,
        };
      }

      return state;
    case ActionTypes.PROJECT_MANAGER_DELETE:
    case ActionTypes.PROJECT_MANAGER_DELETE_HANDLE:
      if (
        state.currentModal === ModalTypes.PROJECT_SETTINGS &&
        payload.isCurrentUser &&
        payload.isCurrentProject
      ) {
        return {
          ...state,
          currentModal: null,
        };
      }

      return state;
    default:
      return state;
  }
};
