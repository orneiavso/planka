import React, { useEffect, useImperativeHandle, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useMarkdownEditor, MarkdownEditorView } from '@gravity-ui/markdown-editor';
import { ThemeProvider, ToasterProvider, ToasterComponent, Toaster } from '@gravity-ui/uikit';

import styles from './MarkdownEditor.module.scss';

// Wlasna, lekka nakladka na biblioteke @gravity-ui/markdown-editor (MIT).
// Tryb WYSIWYG - formatowanie (pogrubienie, naglowki itp.) widac wizualnie,
// bez recznego wpisywania znacznikow markdown. Zachowujemy domyslny pasek
// (m.in. "Cytat"); przycisk "Note" ukrywamy w CSS (patrz MarkdownEditor.module.scss).
// Providery gravity (Theme/Toaster) trzymamy TU, lokalnie przy edytorze - NIE
// globalnie w Root - zeby wrapper .g-root nie obejmowal boardu i nie psul
// react-beautiful-dnd (przeciaganie kart miedzy listami).

const MarkdownEditor = React.forwardRef(({ defaultValue, onChange, onSubmit, onCancel }, ref) => {
  const toaster = useMemo(() => new Toaster(), []);

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
    <ThemeProvider theme="light">
      <ToasterProvider toaster={toaster}>
        <div className={styles.wrapper}>
          <MarkdownEditorView autofocus stickyToolbar editor={editor} className={styles.editor} />
        </div>
        <ToasterComponent />
      </ToasterProvider>
    </ThemeProvider>
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
