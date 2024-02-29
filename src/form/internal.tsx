// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';

import { getBaseProps } from '../internal/base-component';
import InternalAlert from '../alert/internal';
import InternalBox from '../box/internal';
import InternalContentLayout from '../content-layout/internal';
import styles from './styles.css.js';
import { FormLayoutProps, FormProps } from './interfaces';
import { InternalBaseComponentProps } from '../internal/hooks/use-base-component';
import LiveRegion from '../internal/components/live-region';
import { useInternalI18n } from '../i18n/context';
import { trackEvent } from '../internal/analytics';

export type InternalFormProps = FormProps & InternalBaseComponentProps;

function FormError({
  children,
  errorIconAriaLabelOverride,
}: {
  children: React.ReactNode;
  errorIconAriaLabelOverride?: InternalFormProps['errorIconAriaLabel'];
}) {
  const ref = useRef<HTMLElement | null>(null);
  const i18n = useInternalI18n('form');
  const errorIconAriaLabel = i18n('errorIconAriaLabel', errorIconAriaLabelOverride);

  useEffect(() => {
    const currentRef = ref.current as HTMLElement;
    trackEvent(currentRef, 'error', {
      componentName: 'Form',
      detail: { errorText: currentRef.textContent },
    });

    return () => {
      trackEvent(currentRef, 'error-cleared', {
        componentName: 'Form',
      });
    };
  }, []);

  return (
    <InternalBox __internalRootRef={ref} margin={{ top: 'l' }}>
      <InternalAlert type="error" statusIconAriaLabel={errorIconAriaLabel}>
        <div className={styles.error}>{children}</div>
      </InternalAlert>
    </InternalBox>
  );
}

export default function InternalForm({
  children,
  header,
  errorText,
  errorIconAriaLabel,
  actions,
  secondaryActions,
  variant,
  __internalRootRef,
  ...props
}: InternalFormProps) {
  const baseProps = getBaseProps(props);

  return (
    <div {...baseProps} ref={__internalRootRef} className={clsx(styles.root, baseProps.className)}>
      <FormLayout
        header={
          header && (
            <div
              data-analytics-selector="form-header"
              className={clsx(styles.header, variant === 'full-page' && styles['full-page'])}
            >
              {header}
            </div>
          )
        }
        variant={variant}
      >
        {children && <div className={styles.content}>{children}</div>}
        {errorText && <FormError errorIconAriaLabelOverride={errorIconAriaLabel}>{errorText}</FormError>}
        {(actions || secondaryActions) && (
          <div className={styles.footer}>
            <div className={styles['actions-section']}>
              {actions && <div className={styles.actions}>{actions}</div>}
              {secondaryActions && <div className={styles['secondary-actions']}>{secondaryActions}</div>}
            </div>
          </div>
        )}
        {errorText && (
          <LiveRegion assertive={true}>
            {errorIconAriaLabel}, {errorText}
          </LiveRegion>
        )}
      </FormLayout>
    </div>
  );
}

function FormLayout({ children, header, variant }: FormLayoutProps) {
  return variant === 'full-page' && header ? (
    <InternalContentLayout header={header}>{children}</InternalContentLayout>
  ) : (
    <>
      {header}
      {children}
    </>
  );
}
