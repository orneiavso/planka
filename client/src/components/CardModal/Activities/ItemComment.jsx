import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Comment } from 'semantic-ui-react';
import { usePopup } from '../../../lib/popup';
import { Markdown } from '../../../lib/custom-ui';

import getDateFormat from '../../../utils/get-date-format';
import CommentEdit from './CommentEdit';
import User from '../../User';
import DeleteStep from '../../DeleteStep';

import styles from './ItemComment.module.scss';

const ItemComment = React.memo(
  ({ data, createdAt, isPersisted, user, canEdit, onUpdate, onDelete }) => {
    const [t] = useTranslation();

    const commentEdit = useRef(null);

    const handleEditClick = useCallback(() => {
      commentEdit.current.open();
    }, []);

    const DeletePopup = usePopup(DeleteStep);

    return (
      <Comment>
        <span className={styles.user}>
          <User name={user.name} avatarUrl={user.avatarUrl} />
        </span>
        <div className={classNames(styles.content)}>
          <CommentEdit
            ref={commentEdit}
            defaultData={data}
            onUpdate={onUpdate}
            text={
              <div className={styles.bubble}>
                <div className={styles.header}>
                  <span className={styles.author}>{user.name}</span>
                </div>
                <div className={styles.text}>
                  <Markdown linkTarget="_blank">{data.text}</Markdown>
                </div>
                <Comment.Actions className={styles.information}>
                  <span className={styles.date}>
                    {t(`format:${getDateFormat(createdAt)}`, {
                      postProcess: 'formatDate',
                      value: createdAt,
                    })}
                  </span>
                  {canEdit && (
                    <span className={styles.actions}>
                      <Comment.Action
                        as="button"
                        content={t('action.edit')}
                        disabled={!isPersisted}
                        onClick={handleEditClick}
                      />
                      <DeletePopup
                        title="common.deleteComment"
                        content="common.areYouSureYouWantToDeleteThisComment"
                        buttonContent="action.deleteComment"
                        onConfirm={onDelete}
                      >
                        <Comment.Action
                          as="button"
                          content={t('action.delete')}
                          disabled={!isPersisted}
                        />
                      </DeletePopup>
                    </span>
                  )}
                </Comment.Actions>
              </div>
            }
          />
        </div>
      </Comment>
    );
  },
);

ItemComment.propTypes = {
  data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  createdAt: PropTypes.instanceOf(Date).isRequired,
  isPersisted: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default ItemComment;
