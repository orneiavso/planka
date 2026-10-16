export default () => {
  document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
};
