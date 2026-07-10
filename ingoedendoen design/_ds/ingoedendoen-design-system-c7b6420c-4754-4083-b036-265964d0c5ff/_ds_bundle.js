/* @ds-bundle: {"format":3,"namespace":"InGoedendoenDesignSystem_c7b642","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"ArticlePage","sourcePath":"ui_kits/website/ArticlePage.jsx"},{"name":"HomePage","sourcePath":"ui_kits/website/HomePage.jsx"},{"name":"Navigation","sourcePath":"ui_kits/website/Navigation.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"ff5b54ef3aa4","components/core/Button.jsx":"61fdc852a582","components/core/Card.jsx":"da69afc72a13","components/core/Input.jsx":"10e70c42b26d","components/core/Tag.jsx":"007f5800c933","ui_kits/website/ArticlePage.jsx":"a82a96f366a2","ui_kits/website/HomePage.jsx":"63fec9ca4926","ui_kits/website/Navigation.jsx":"382fe7643879"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.InGoedendoenDesignSystem_c7b642 = window.InGoedendoenDesignSystem_c7b642 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const injectStyles = (id, css) => {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const el = document.createElement('style');
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }
};
injectStyles('igds-badge', `
  .igds-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    font-family: var(--font-sans);
    font-weight: var(--font-semibold);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    border-radius: var(--radius-full);
    white-space: nowrap;
    line-height: 1;
  }

  /* Sizes */
  .igds-badge--sm { font-size: 0.625rem; padding: 3px 8px; }
  .igds-badge--md { font-size: var(--text-xs);  padding: 4px 10px; }
  .igds-badge--lg { font-size: var(--text-sm);  padding: 5px 12px; }

  /* Colors */
  .igds-badge--lime    { background: var(--color-lime-100);  color: var(--color-lime-600); }
  .igds-badge--pink    { background: var(--color-pink-100);  color: var(--color-pink-600); }
  .igds-badge--blue    { background: var(--color-blue-100);  color: var(--color-blue-600); }
  .igds-badge--neutral { background: var(--color-neutral-100); color: var(--color-neutral-600); }
  .igds-badge--dark    { background: var(--color-neutral-900); color: var(--color-neutral-0); }
  .igds-badge--white   { background: rgba(255,255,255,0.15); color: var(--color-neutral-0); backdrop-filter: blur(4px); }

  /* Solid variants */
  .igds-badge--lime-solid    { background: var(--color-lime-400);  color: var(--color-neutral-900); }
  .igds-badge--pink-solid    { background: var(--color-pink-500);  color: var(--color-neutral-0); }
  .igds-badge--blue-solid    { background: var(--color-blue-500);  color: var(--color-neutral-0); }
  .igds-badge--neutral-solid { background: var(--color-neutral-200); color: var(--color-neutral-700); }

  .igds-badge__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }
`);
function Badge({
  color = 'lime',
  solid = false,
  size = 'md',
  dot = false,
  children,
  className = '',
  ...props
}) {
  const colorClass = solid ? `igds-badge--${color}-solid` : `igds-badge--${color}`;
  const classes = ['igds-badge', `igds-badge--${size}`, colorClass, className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: classes
  }, props), dot && /*#__PURE__*/React.createElement("span", {
    className: "igds-badge__dot"
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const injectStyles = (id, css) => {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const el = document.createElement('style');
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }
};
injectStyles('igds-button', `
  .igds-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    font-family: var(--font-sans);
    font-weight: var(--font-semibold);
    font-size: var(--text-base);
    line-height: 1;
    border: 2px solid transparent;
    border-radius: var(--radius-full);
    cursor: pointer;
    text-decoration: none;
    white-space: nowrap;
    -webkit-font-smoothing: antialiased;
    transition: background-color var(--duration-base) var(--ease-out),
                color var(--duration-base) var(--ease-out),
                border-color var(--duration-base) var(--ease-out),
                transform var(--duration-fast) var(--ease-default),
                box-shadow var(--duration-base) var(--ease-out);
    position: relative;
    user-select: none;
  }
  .igds-btn:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }
  .igds-btn:active:not(:disabled) {
    transform: scale(var(--scale-press));
  }
  .igds-btn:disabled {
    opacity: var(--opacity-disabled);
    cursor: not-allowed;
    pointer-events: none;
  }

  /* Sizes */
  .igds-btn--xs  { height: 28px; padding: 0 var(--space-3);  font-size: var(--text-xs); }
  .igds-btn--sm  { height: 36px; padding: 0 var(--space-4);  font-size: var(--text-sm); }
  .igds-btn--md  { height: 44px; padding: 0 var(--space-6);  font-size: var(--text-base); }
  .igds-btn--lg  { height: 52px; padding: 0 var(--space-8);  font-size: var(--text-lg); }
  .igds-btn--xl  { height: 60px; padding: 0 var(--space-10); font-size: var(--text-xl); }

  /* Variant: primary (lime green) */
  .igds-btn--primary {
    background: var(--color-lime-400);
    color: var(--color-neutral-900);
    border-color: var(--color-lime-400);
  }
  .igds-btn--primary:hover:not(:disabled) {
    background: var(--color-lime-500);
    border-color: var(--color-lime-500);
  }

  /* Variant: accent (hot pink) */
  .igds-btn--accent {
    background: var(--color-pink-500);
    color: var(--color-neutral-0);
    border-color: var(--color-pink-500);
    box-shadow: var(--shadow-accent);
  }
  .igds-btn--accent:hover:not(:disabled) {
    background: var(--color-pink-600);
    border-color: var(--color-pink-600);
  }

  /* Variant: secondary (outlined) */
  .igds-btn--secondary {
    background: transparent;
    color: var(--color-text-primary);
    border-color: var(--color-border-default);
  }
  .igds-btn--secondary:hover:not(:disabled) {
    border-color: var(--color-neutral-900);
    background: var(--color-neutral-50);
  }

  /* Variant: ghost */
  .igds-btn--ghost {
    background: transparent;
    color: var(--color-text-primary);
    border-color: transparent;
  }
  .igds-btn--ghost:hover:not(:disabled) {
    background: var(--color-neutral-100);
  }

  /* Variant: dark (inverted) */
  .igds-btn--dark {
    background: var(--color-neutral-900);
    color: var(--color-neutral-0);
    border-color: var(--color-neutral-900);
  }
  .igds-btn--dark:hover:not(:disabled) {
    background: var(--color-neutral-800);
    border-color: var(--color-neutral-800);
  }

  .igds-btn--full { width: 100%; }
  .igds-btn__icon { display: flex; align-items: center; flex-shrink: 0; }
`);
function Button({
  variant = 'primary',
  size = 'md',
  children,
  disabled = false,
  fullWidth = false,
  iconLeft = null,
  iconRight = null,
  as: Tag = 'button',
  className = '',
  ...props
}) {
  const classes = ['igds-btn', `igds-btn--${variant}`, `igds-btn--${size}`, fullWidth ? 'igds-btn--full' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: classes,
    disabled: Tag === 'button' ? disabled : undefined
  }, props), iconLeft && /*#__PURE__*/React.createElement("span", {
    className: "igds-btn__icon"
  }, iconLeft), children, iconRight && /*#__PURE__*/React.createElement("span", {
    className: "igds-btn__icon"
  }, iconRight));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const injectStyles = (id, css) => {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const el = document.createElement('style');
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }
};
injectStyles('igds-card', `
  .igds-card {
    display: flex;
    flex-direction: column;
    background: var(--color-surface-card);
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1px solid var(--color-border-default);
    text-decoration: none;
    color: inherit;
    transition: transform var(--duration-base) var(--ease-out),
                box-shadow var(--duration-base) var(--ease-out);
    box-shadow: var(--shadow-sm);
    cursor: pointer;
  }
  .igds-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg);
    text-decoration: none;
  }
  .igds-card--featured {
    box-shadow: var(--shadow-brand);
  }
  .igds-card--featured:hover {
    box-shadow: 0 16px 40px rgba(169,211,0,0.35);
  }
  .igds-card--horizontal {
    flex-direction: row;
  }

  .igds-card__media {
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
  }
  .igds-card__media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform var(--duration-slow) var(--ease-out);
  }
  .igds-card:hover .igds-card__media img {
    transform: scale(1.04);
  }
  .igds-card--default .igds-card__media { aspect-ratio: 16/9; }
  .igds-card--compact .igds-card__media { aspect-ratio: 3/2; }
  .igds-card--horizontal .igds-card__media {
    width: 180px;
    aspect-ratio: auto;
  }

  .igds-card__body {
    padding: var(--space-5) var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    flex: 1;
  }
  .igds-card--compact .igds-card__body {
    padding: var(--space-4);
    gap: var(--space-1-5);
  }

  .igds-card__category {
    font-family: var(--font-sans);
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
    letter-spacing: var(--tracking-wider);
    text-transform: uppercase;
    color: var(--color-text-brand);
  }

  .igds-card__title {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    font-weight: var(--font-semibold);
    line-height: var(--leading-snug);
    letter-spacing: var(--tracking-snug);
    color: var(--color-text-primary);
    text-wrap: balance;
    margin: 0;
  }
  .igds-card--compact .igds-card__title {
    font-size: var(--text-base);
    font-weight: var(--font-semibold);
  }
  .igds-card--horizontal .igds-card__title {
    font-size: var(--text-lg);
  }

  .igds-card__excerpt {
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    line-height: var(--leading-relaxed);
    color: var(--color-text-secondary);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin: 0;
  }

  .igds-card__meta {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-top: var(--space-1);
  }
  .igds-card__meta-item {
    font-family: var(--font-sans);
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }
  .igds-card__meta-dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: var(--color-neutral-300);
    flex-shrink: 0;
  }
`);
function Card({
  variant = 'default',
  featured = false,
  image,
  imageAlt = '',
  category,
  title,
  excerpt,
  readTime,
  date,
  href = '#',
  as: Tag = 'a',
  className = '',
  ...props
}) {
  const classes = ['igds-card', `igds-card--${variant}`, featured ? 'igds-card--featured' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: classes,
    href: Tag === 'a' ? href : undefined
  }, props), image && /*#__PURE__*/React.createElement("div", {
    className: "igds-card__media"
  }, /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: imageAlt || title,
    loading: "lazy"
  })), /*#__PURE__*/React.createElement("div", {
    className: "igds-card__body"
  }, category && /*#__PURE__*/React.createElement("span", {
    className: "igds-card__category"
  }, category), /*#__PURE__*/React.createElement("h3", {
    className: "igds-card__title"
  }, title), excerpt && /*#__PURE__*/React.createElement("p", {
    className: "igds-card__excerpt"
  }, excerpt), (readTime || date) && /*#__PURE__*/React.createElement("div", {
    className: "igds-card__meta"
  }, readTime && /*#__PURE__*/React.createElement("span", {
    className: "igds-card__meta-item"
  }, readTime, " min lezen"), readTime && date && /*#__PURE__*/React.createElement("span", {
    className: "igds-card__meta-dot"
  }), date && /*#__PURE__*/React.createElement("span", {
    className: "igds-card__meta-item"
  }, date))));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
const injectStyles = (id, css) => {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const el = document.createElement('style');
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }
};
injectStyles('igds-input', `
  .igds-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1-5);
    width: 100%;
  }
  .igds-field__label {
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    color: var(--color-text-primary);
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }
  .igds-field__label-required {
    color: var(--color-pink-500);
    font-size: 0.9em;
  }
  .igds-field__wrap {
    position: relative;
    display: flex;
    align-items: center;
  }
  .igds-input {
    width: 100%;
    font-family: var(--font-sans);
    font-size: var(--text-base);
    font-weight: var(--font-regular);
    color: var(--color-text-primary);
    background: var(--color-surface-page);
    border: 2px solid var(--color-border-default);
    border-radius: var(--radius-md);
    transition: border-color var(--duration-base) var(--ease-out),
                box-shadow var(--duration-base) var(--ease-out);
    outline: none;
    -webkit-appearance: none;
    line-height: 1.4;
  }
  .igds-input::placeholder { color: var(--color-text-tertiary); }
  .igds-input:hover:not(:disabled) { border-color: var(--color-border-strong); }
  .igds-input:focus {
    border-color: var(--color-lime-400);
    box-shadow: 0 0 0 3px rgba(169,211,0,0.2);
  }
  .igds-input:disabled {
    opacity: var(--opacity-disabled);
    cursor: not-allowed;
    background: var(--color-neutral-100);
  }

  /* Sizes */
  .igds-input--sm { height: 36px; padding: 0 var(--space-3); font-size: var(--text-sm); border-radius: var(--radius-sm); }
  .igds-input--md { height: 44px; padding: 0 var(--space-4); }
  .igds-input--lg { height: 52px; padding: 0 var(--space-5); font-size: var(--text-lg); border-radius: var(--radius-lg); }

  /* With icons */
  .igds-input--icon-left  { padding-left: var(--space-10); }
  .igds-input--icon-right { padding-right: var(--space-10); }
  .igds-field__icon {
    position: absolute;
    display: flex;
    align-items: center;
    pointer-events: none;
    color: var(--color-text-tertiary);
  }
  .igds-field__icon--left  { left: var(--space-3); }
  .igds-field__icon--right { right: var(--space-3); }

  /* Error state */
  .igds-input--error {
    border-color: var(--color-pink-500);
  }
  .igds-input--error:focus {
    box-shadow: 0 0 0 3px rgba(220,0,116,0.15);
    border-color: var(--color-pink-500);
  }

  .igds-field__hint {
    font-family: var(--font-sans);
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
    line-height: 1.4;
  }
  .igds-field__hint--error { color: var(--color-pink-500); }
`);
function Input({
  label,
  hint,
  error,
  size = 'md',
  required = false,
  disabled = false,
  iconLeft = null,
  iconRight = null,
  id,
  className = '',
  ...props
}) {
  const inputId = id || (label ? `igds-input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  const inputClasses = ['igds-input', `igds-input--${size}`, error ? 'igds-input--error' : '', iconLeft ? 'igds-input--icon-left' : '', iconRight ? 'igds-input--icon-right' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", {
    className: "igds-field"
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "igds-field__label",
    htmlFor: inputId
  }, label, required && /*#__PURE__*/React.createElement("span", {
    className: "igds-field__label-required"
  }, "*")), /*#__PURE__*/React.createElement("div", {
    className: "igds-field__wrap"
  }, iconLeft && /*#__PURE__*/React.createElement("span", {
    className: "igds-field__icon igds-field__icon--left"
  }, iconLeft), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    className: inputClasses,
    disabled: disabled,
    required: required,
    "aria-invalid": !!error,
    "aria-describedby": hint || error ? `${inputId}-hint` : undefined
  }, props)), iconRight && /*#__PURE__*/React.createElement("span", {
    className: "igds-field__icon igds-field__icon--right"
  }, iconRight)), (hint || error) && /*#__PURE__*/React.createElement("span", {
    id: `${inputId}-hint`,
    className: `igds-field__hint${error ? ' igds-field__hint--error' : ''}`
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const injectStyles = (id, css) => {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const el = document.createElement('style');
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }
};
injectStyles('igds-tag', `
  .igds-tag {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1-5);
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    line-height: 1;
    border-radius: var(--radius-full);
    border: 1.5px solid var(--color-border-default);
    background: var(--color-surface-page);
    color: var(--color-text-secondary);
    padding: var(--space-1-5) var(--space-4);
    cursor: pointer;
    white-space: nowrap;
    text-decoration: none;
    transition: background-color var(--duration-base) var(--ease-out),
                border-color var(--duration-base) var(--ease-out),
                color var(--duration-base) var(--ease-out),
                transform var(--duration-fast) var(--ease-default);
    user-select: none;
  }
  .igds-tag:hover:not(.igds-tag--active):not(:disabled) {
    border-color: var(--color-neutral-400);
    color: var(--color-text-primary);
    background: var(--color-neutral-50);
  }
  .igds-tag:active:not(:disabled) {
    transform: scale(0.97);
  }
  .igds-tag:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }
  .igds-tag--active {
    background: var(--color-neutral-900);
    border-color: var(--color-neutral-900);
    color: var(--color-neutral-0);
  }
  .igds-tag--active:hover {
    background: var(--color-neutral-800);
    border-color: var(--color-neutral-800);
  }
  .igds-tag--brand {
    background: var(--color-lime-100);
    border-color: var(--color-lime-400);
    color: var(--color-lime-600);
  }
  .igds-tag--brand:hover:not(.igds-tag--active) {
    background: var(--color-lime-200);
  }
  .igds-tag--sm { font-size: var(--text-xs); padding: var(--space-1) var(--space-3); }
  .igds-tag--lg { font-size: var(--text-base); padding: var(--space-2) var(--space-5); }

  .igds-tag__count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--color-neutral-200);
    color: var(--color-text-secondary);
    border-radius: var(--radius-full);
    font-size: 0.65em;
    font-weight: var(--font-semibold);
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
  }
  .igds-tag--active .igds-tag__count {
    background: rgba(255,255,255,0.2);
    color: var(--color-neutral-0);
  }
`);
function Tag({
  active = false,
  variant = 'default',
  size = 'md',
  count,
  children,
  as: Component = 'button',
  className = '',
  ...props
}) {
  const classes = ['igds-tag', `igds-tag--${size}`, active ? 'igds-tag--active' : '', variant === 'brand' ? 'igds-tag--brand' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement(Component, _extends({
    className: classes,
    type: Component === 'button' ? 'button' : undefined
  }, props), children, count !== undefined && /*#__PURE__*/React.createElement("span", {
    className: "igds-tag__count"
  }, count));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/ArticlePage.jsx
try { (() => {
/**
 * InGoedendoen article reading view.
 * Category badge → STIX Two Text headline → meta → hero image → article body
 */

function ArticlePage({
  article,
  onBack
}) {
  if (!article) return null;
  const CAT_COLOR = {
    voeding: 'var(--color-lime-400)',
    beweging: 'var(--color-blue-500)',
    mindset: 'var(--color-pink-500)',
    recepten: 'var(--color-neutral-600)'
  };
  return /*#__PURE__*/React.createElement("article", {
    style: {
      maxWidth: '760px',
      margin: '0 auto',
      padding: '40px 32px 96px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      fontSize: '0.875rem',
      fontWeight: 500,
      color: 'var(--color-text-secondary)',
      padding: '0',
      marginBottom: '32px'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "15 18 9 12 15 6"
  })), "Terug naar overzicht"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: '0.75rem',
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: CAT_COLOR[article.category] || 'var(--color-text-brand)'
    }
  }, article.category), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-serif)',
      fontWeight: 600,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
      color: 'var(--color-text-primary)',
      margin: '12px 0 20px',
      textWrap: 'balance'
    }
  }, article.title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '16px',
      fontFamily: 'var(--font-sans)',
      fontSize: '0.875rem',
      color: 'var(--color-text-tertiary)',
      marginBottom: '32px'
    }
  }, /*#__PURE__*/React.createElement("span", null, article.readTime, " min lezen"), /*#__PURE__*/React.createElement("span", null, "\xB7"), /*#__PURE__*/React.createElement("span", null, article.date)), article.image && /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      marginBottom: '40px',
      aspectRatio: '16/9'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: article.image,
    alt: article.title,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-serif)',
      fontSize: '1.125rem',
      lineHeight: 1.8,
      color: 'var(--color-text-primary)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }
  }, (article.body || article.excerpt).split('\n').filter(p => p.trim()).map((p, i) => /*#__PURE__*/React.createElement("p", {
    key: i,
    style: {
      margin: 0
    }
  }, p.trim()))));
}
Object.assign(window, {
  ArticlePage
});
Object.assign(__ds_scope, { ArticlePage });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/ArticlePage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/HomePage.jsx
try { (() => {
/**
 * InGoedendoen homepage composition.
 * Hero → Category filter → Article grid → Newsletter CTA
 */

// Uses DS components: Button, Badge, Tag, Card (from window.InGoedendoenDesignSystem_c7b642)

function HomePage({
  articles,
  onNavigate,
  activeCategory,
  setActiveCategory
}) {
  const categories = ['Alle', 'voeding', 'beweging', 'mindset', 'recepten'];
  const filtered = activeCategory === 'Alle' ? articles : articles.filter(a => a.category === activeCategory);
  return /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement(HeroSection, null), /*#__PURE__*/React.createElement("section", {
    style: {
      maxWidth: '1344px',
      margin: '0 auto',
      padding: '40px 48px 80px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px',
      marginBottom: '32px',
      flexWrap: 'wrap'
    }
  }, categories.map(cat => /*#__PURE__*/React.createElement("button", {
    key: cat,
    onClick: () => setActiveCategory(cat),
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: '0.875rem',
      fontWeight: 500,
      borderRadius: '9999px',
      border: '1.5px solid',
      padding: '6px 16px',
      cursor: 'pointer',
      transition: 'all 150ms',
      background: activeCategory === cat ? 'var(--color-neutral-900)' : 'transparent',
      borderColor: activeCategory === cat ? 'var(--color-neutral-900)' : 'var(--color-border-default)',
      color: activeCategory === cat ? '#fff' : 'var(--color-text-secondary)'
    }
  }, cat))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '24px'
    }
  }, filtered.map(article => /*#__PURE__*/React.createElement(ArticleCard, {
    key: article.id,
    article: article,
    onNavigate: onNavigate
  })))), /*#__PURE__*/React.createElement(NewsletterSection, null));
}
Object.assign(window, {
  HomePage
});
Object.assign(__ds_scope, { HomePage });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/HomePage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Navigation.jsx
try { (() => {
/**
 * Top navigation bar for InGoedendoen.
 * Dark background, sticky, with logo + nav links + search + newsletter CTA.
 */

const NAV_LINKS = ['Voeding', 'Beweging', 'Mindset', 'Recepten'];
function Navigation({
  onHome
}) {
  const [hovered, setHovered] = React.useState(null);
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      background: 'var(--color-neutral-900)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 48px',
      height: '64px',
      position: 'sticky',
      top: 0,
      zIndex: 'var(--z-sticky)',
      boxShadow: '0 1px 0 rgba(255,255,255,0.06)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: onHome,
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: '1.3125rem',
      fontWeight: 700,
      color: '#fff',
      cursor: 'pointer',
      letterSpacing: '-0.02em',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-lime-400)'
    }
  }, "In"), "Goedendoen"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '4px',
      marginLeft: '40px',
      flex: 1
    }
  }, NAV_LINKS.map(link => /*#__PURE__*/React.createElement("a", {
    key: link,
    href: "#",
    onClick: e => e.preventDefault(),
    onMouseEnter: () => setHovered(link),
    onMouseLeave: () => setHovered(null),
    style: {
      color: hovered === link ? '#fff' : 'var(--color-neutral-400)',
      fontFamily: 'var(--font-sans)',
      fontSize: '0.9375rem',
      fontWeight: 500,
      padding: '6px 14px',
      borderRadius: '6px',
      textDecoration: 'none',
      background: hovered === link ? 'rgba(255,255,255,0.06)' : 'transparent',
      transition: 'color 150ms, background 150ms'
    }
  }, link))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '16px',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--color-neutral-400)',
      display: 'flex',
      padding: '4px'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "8"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "21",
    y1: "21",
    x2: "16.65",
    y2: "16.65"
  }))), /*#__PURE__*/React.createElement("button", {
    style: {
      background: 'var(--color-lime-400)',
      color: 'var(--color-neutral-900)',
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: '0.875rem',
      border: 'none',
      borderRadius: '9999px',
      padding: '8px 18px',
      cursor: 'pointer'
    }
  }, "Nieuwsbrief")));
}
Object.assign(window, {
  Navigation
});
Object.assign(__ds_scope, { Navigation });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Navigation.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.ArticlePage = __ds_scope.ArticlePage;

__ds_ns.HomePage = __ds_scope.HomePage;

__ds_ns.Navigation = __ds_scope.Navigation;

})();
