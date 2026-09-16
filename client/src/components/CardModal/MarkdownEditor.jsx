import React, { useEffect, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import { useMarkdownEditor, MarkdownEditorView } from '@gravity-ui/markdown-editor';

import styles from './MarkdownEditor.module.scss';

// Własna, lekka nakładka na bibliotekę @gravity-ui/markdown-editor (MIT).
// Tryb WYSIWYG — formatowanie (pogrubienie, nagłówki itp.) widać wizualnie,
// bez ręcznego wpisywania znaczników markdown. Zachowujemy domyślny pasek
// (m.in. „Cytat"); przycisk „Note" ukrywamy w CSS (patrz MarkdownEditor.module.scss).

const MarkdownEditor = React.forwardRef(({ defaultValue, onChange, onSubmit, onCancel }, ref) => {
  const editor = useMarkdownEditor({
    md: {
      breaks: true,
      linkify: true,
    },
    initial: {
      markup: defaultValue || '',
      mode: 'wysiwyg',
    },
  });

  useImperativeHandle(ref, () => ({ getValue: () => editor.getValue() }), [editor]);

  useEffect(() => {
    const handleChange = () => onChange(editor.getValue());
    const handleSubmit = () => {
      if (onSubmit) {
        onSubmit();
      }
    };
    const handleCancel = () => {
      if (onCancel) {
        onCancel();
      }
    };

    editor.on('change', handleChange);
    editor.on('submit', handleSubmit);
    editor.on('cancel', handleCancel);

    return () => {
      editor.off('change', handleChange);
      editor.off('submit', handleSubmit);
      editor.off('cancel', handleCancel);
    };
  }, [editor, onChange, onSubmit, onCancel]);

  return (
    <div className={styles.wrapper}>
      <MarkdownEditorView autofocus stickyToolbar editor={editor} className={styles.editor} />
    </div>
  );
});

MarkdownEditor.propTypes = {
  defaultValue: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
};

MarkdownEditor.defaultProps = {
  defaultValue: '',
  onSubmit: undefined,
  onCancel: undefined,
};

export default React.memo(MarkdownEditor);
