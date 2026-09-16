import React, { useCallback, useImperativeHandle, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Form } from 'semantic-ui-react';

import MarkdownEditor from './MarkdownEditor';

import styles from './DescriptionEdit.module.scss';

const DescriptionEdit = React.forwardRef(({ children, defaultValue, onUpdate }, ref) => {
  const [t] = useTranslation();
  const [isOpened, setIsOpened] = useState(false);

  const editorRef = useRef(null);
  const valueRef = useRef(defaultValue || '');

  const open = useCallback(() => {
    valueRef.current = defaultValue || '';
    setIsOpened(true);
  }, [defaultValue]);

  const submit = useCallback(() => {
    const rawValue = editorRef.current ? editorRef.current.getValue() : valueRef.current;
    const cleanValue = (rawValue || '').trim() || null;

    if (cleanValue !== defaultValue) {
      onUpdate(cleanValue);
    }

    setIsOpened(false);
  }, [defaultValue, onUpdate]);

  const cancel = useCallback(() => {
    setIsOpened(false);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      open,
      close: submit,
    }),
    [open, submit],
  );

  const handleChange = useCallback((value) => {
    valueRef.current = value;
  }, []);

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);

  const handleChildrenClick = useCallback(() => {
    if (!window.getSelection().toString()) {
      open();
    }
  }, [open]);

  if (!isOpened) {
    return React.cloneElement(children, {
      onClick: handleChildrenClick,
    });
  }

  return (
    <Form onSubmit={handleSubmit}>
      <MarkdownEditor
        ref={editorRef}
        defaultValue={defaultValue || ''}
        onChange={handleChange}
        onSubmit={submit}
        onCancel={cancel}
      />
      <div className={styles.controls}>
        <Button positive content={t('action.save')} />
      </div>
    </Form>
  );
});

DescriptionEdit.propTypes = {
  children: PropTypes.element.isRequired,
  defaultValue: PropTypes.string,
  onUpdate: PropTypes.func.isRequired,
};

DescriptionEdit.defaultProps = {
  defaultValue: undefined,
};

export default React.memo(DescriptionEdit);
