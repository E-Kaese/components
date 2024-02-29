// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useRef } from 'react';
import clsx from 'clsx';

import { fireCancelableEvent, isPlainLeftClick } from '../internal/events';
import useForwardFocus from '../internal/hooks/forward-focus';
import styles from './styles.css.js';
import { ButtonIconProps, LeftIcon, RightIcon } from './icon-helper';
import { ButtonProps } from './interfaces';
import { InternalBaseComponentProps } from '../internal/hooks/use-base-component';
import { checkSafeUrl } from '../internal/utils/check-safe-url';
import { useMergeRefs } from '../internal/hooks/use-merge-refs';
import LiveRegion from '../internal/components/live-region';
import { useButtonContext } from '../internal/context/button-context';
import { usePerformanceMarks } from '../internal/hooks/use-performance-marks';
import { useSingleTabStopNavigation } from '../internal/context/single-tab-stop-navigation-context';

import { trackEvent } from '../internal/analytics';

export type InternalButtonProps = Omit<ButtonProps, 'variant'> & {
  variant?: ButtonProps['variant'] | 'flashbar-icon' | 'breadcrumb-group' | 'menu-trigger' | 'modal-dismiss';
  badge?: boolean;
  __nativeAttributes?:
    | (React.HTMLAttributes<HTMLAnchorElement> & React.HTMLAttributes<HTMLButtonElement>)
    | Record<`data-${string}`, string>;
  __iconClass?: string;
  __focusable?: boolean;
} & InternalBaseComponentProps<HTMLAnchorElement | HTMLButtonElement>;

export const InternalButton = React.forwardRef(
  (
    {
      children,
      iconName,
      __iconClass,
      onClick,
      onFollow,
      iconAlign = 'left',
      iconUrl,
      iconSvg,
      iconAlt,
      variant = 'normal',
      loading = false,
      loadingText,
      disabled = false,
      wrapText = true,
      href,
      target,
      rel,
      download,
      formAction = 'submit',
      ariaLabel,
      ariaDescribedby,
      ariaExpanded,
      ariaControls,
      fullWidth,
      badge,
      __nativeAttributes,
      __internalRootRef = null,
      __focusable = false,
      ...props
    }: InternalButtonProps,
    ref: React.Ref<ButtonProps.Ref>
  ) => {
    checkSafeUrl('Button', href);
    const isAnchor = Boolean(href);
    const isNotInteractive = loading || disabled;
    const hasAriaDisabled = (loading && !disabled) || (disabled && __focusable);
    const shouldHaveContent =
      children && ['icon', 'inline-icon', 'flashbar-icon', 'modal-dismiss'].indexOf(variant) === -1;

    const buttonRef = useRef<HTMLElement>(null);
    useForwardFocus(ref, buttonRef);

    const buttonContext = useButtonContext();

    usePerformanceMarks(
      'primaryButton',
      variant === 'primary',
      buttonRef,
      () => ({
        loading,
        disabled,
        text: buttonRef.current?.innerText,
      }),
      [loading, disabled]
    );

    const handleClick = (event: React.MouseEvent) => {
      if (isNotInteractive) {
        return event.preventDefault();
      }

      if (isAnchor && isPlainLeftClick(event)) {
        fireCancelableEvent(onFollow, { href, target }, event);

        if (iconName === 'external' || target === '_blank') {
          buttonRef.current &&
            trackEvent(buttonRef.current, 'external-link', { componentName: 'Button', detail: { variant } });
        }
      }

      const { altKey, button, ctrlKey, metaKey, shiftKey } = event;
      fireCancelableEvent(onClick, { altKey, button, ctrlKey, metaKey, shiftKey }, event);
      buttonContext.onClick({ variant });
      buttonRef.current && trackEvent(buttonRef.current, 'click', { componentName: 'Button', detail: { variant } });
    };

    const handleFocus = () => {
      buttonRef.current && trackEvent(buttonRef.current, 'focus', { componentName: 'Button' });
    };

    const handleBlur = () => {
      buttonRef.current && trackEvent(buttonRef.current, 'blur', { componentName: 'Button' });
    };

    const buttonClass = clsx(props.className, styles.button, styles[`variant-${variant}`], {
      [styles.disabled]: isNotInteractive,
      [styles['button-no-wrap']]: !wrapText,
      [styles['button-no-text']]: !shouldHaveContent,
      [styles['full-width']]: shouldHaveContent && fullWidth,
    });

    const explicitTabIndex =
      __nativeAttributes && 'tabIndex' in __nativeAttributes ? __nativeAttributes.tabIndex : undefined;
    const { tabIndex } = useSingleTabStopNavigation(buttonRef, {
      tabIndex: isAnchor && isNotInteractive ? -1 : explicitTabIndex,
    });

    const buttonProps = {
      ...props,
      ...__nativeAttributes,
      tabIndex,
      // https://github.com/microsoft/TypeScript/issues/36659
      ref: useMergeRefs(buttonRef, __internalRootRef),
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedby,
      'aria-expanded': ariaExpanded,
      'aria-controls': ariaControls,
      // add ariaLabel as `title` as visible hint text
      title: ariaLabel,
      className: buttonClass,
      onClick: handleClick,
      onFocus: handleFocus,
      onBlur: handleBlur,
    } as const;

    const iconProps: ButtonIconProps = {
      loading,
      iconName,
      iconAlign,
      iconUrl,
      iconSvg,
      iconAlt,
      variant,
      badge,
      iconClass: __iconClass,
      iconSize: variant === 'modal-dismiss' ? 'medium' : 'normal',
    };
    const buttonContent = (
      <>
        <LeftIcon {...iconProps} />
        {shouldHaveContent && <span className={styles.content}>{children}</span>}
        <RightIcon {...iconProps} />
      </>
    );

    if (isAnchor) {
      return (
        // https://github.com/yannickcr/eslint-plugin-react/issues/2962
        // eslint-disable-next-line react/jsx-no-target-blank
        <>
          <a
            {...buttonProps}
            href={href}
            target={target}
            // security recommendation: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#target
            rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)}
            aria-disabled={isNotInteractive ? true : undefined}
            download={download}
          >
            {buttonContent}
          </a>
          {loading && loadingText && <LiveRegion>{loadingText}</LiveRegion>}
        </>
      );
    }
    return (
      <>
        <button
          {...buttonProps}
          type={formAction === 'none' ? 'button' : 'submit'}
          disabled={disabled && !__focusable}
          aria-disabled={hasAriaDisabled ? true : undefined}
        >
          {buttonContent}
        </button>
        {loading && loadingText && <LiveRegion>{loadingText}</LiveRegion>}
      </>
    );
  }
);

export default InternalButton;
