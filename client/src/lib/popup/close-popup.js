export default () => {
  // Dispatch on <body> (a real Element), not on document, so global click
  // listeners that read event.target (target.matches / target.getAttribute -
  // e.g. the markdown editor's) do not crash on a non-Element target. It still
  // bubbles up to document, so Semantic UI popups close exactly as before.
  document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
};
