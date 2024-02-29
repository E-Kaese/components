// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useEffect } from 'react';
import clsx from 'clsx';

import { getBaseProps } from '../internal/base-component';
import { FormFieldContext, useFormFieldContext } from '../internal/context/form-field-context';
import { useUniqueId } from '../internal/hooks/use-unique-id';
import { useVisualRefresh } from '../internal/hooks/use-visual-mode';

import InternalGrid from '../grid/internal';
import InternalIcon from '../icon/internal';
import { getAriaDescribedBy, getGridDefinition, getSlotIds } from './util';

import styles from './styles.css.js';
import { InternalFormFieldProps } from './interfaces';
import { joinStrings } from '../internal/utils/strings';
import { useInternalI18n } from '../i18n/context';
import { InfoLinkLabelContext } from '../internal/context/info-link-label-context';
import { trackEvent } from '../internal/analytics';

interface FormFieldErrorProps {
  id?: string;
  children?: React.ReactNode;
  errorIconAriaLabel?: string;
}

export function FormFieldError({ id, children, errorIconAriaLabel }: FormFieldErrorProps) {
  const i18n = useInternalI18n('form-field');

  return (
    <div id={id} className={styles.error}>
      <div className={styles['error-icon-shake-wrapper']}>
        <div
          role="img"
          aria-label={i18n('i18nStrings.errorIconAriaLabel', errorIconAriaLabel)}
          className={styles['error-icon-scale-wrapper']}
        >
          <InternalIcon name="status-warning" size="small" />
        </div>
      </div>
      <span className={styles.error__message}>{children}</span>
    </div>
  );
}

export function ConstraintText({
  id,
  hasError,
  children,
}: {
  id?: string;
  hasError: boolean;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className={clsx(styles.constraint, hasError && styles['constraint-has-error'])}>
      {children}
    </div>
  );
}

export default function InternalFormField({
  controlId,
  stretch = false,
  label,
  info,
  i18nStrings,
  children,
  secondaryControl,
  description,
  constraintText,
  errorText,
  __hideLabel,
  __internalRootRef = null,
  __disableGutters = false,
  ...rest
}: InternalFormFieldProps) {
  const baseProps = getBaseProps(rest);
  const isRefresh = useVisualRefresh();

  const instanceUniqueId = useUniqueId('formField');
  const generatedControlId = controlId || instanceUniqueId;
  const formFieldId = controlId || generatedControlId;

  const slotIds = getSlotIds(formFieldId, label, description, constraintText, errorText);

  const ariaDescribedBy = getAriaDescribedBy(slotIds);

  const gridDefinition = getGridDefinition(stretch, !!secondaryControl, isRefresh);

  const {
    ariaLabelledby: parentAriaLabelledby,
    ariaDescribedby: parentAriaDescribedby,
    invalid: parentInvalid,
  } = useFormFieldContext({});

  const contextValuesWithoutControlId = {
    ariaLabelledby: joinStrings(parentAriaLabelledby, slotIds.label) || undefined,
    ariaDescribedby: joinStrings(parentAriaDescribedby, ariaDescribedBy) || undefined,
    invalid: !!errorText || !!parentInvalid,
  };

  useEffect(() => {
    if (errorText) {
      const currentRef = __internalRootRef?.current;

      const fieldError = currentRef
        ?.querySelector<HTMLElement>(`[id=${slotIds.error}] .${styles.error__message}`)
        ?.innerText?.trim();
      const fieldLabel = currentRef?.querySelector<HTMLElement>(`[id=${slotIds.label}]`!)?.innerText?.trim();

      // We don't want to report an error if it is hidden, e.g. inside an Expandable Section.
      const errorIsVisible = (currentRef?.getBoundingClientRect()?.width ?? 0) > 0;

      if (errorIsVisible && currentRef) {
        trackEvent(currentRef, 'error', { componentName: 'FormField', detail: { fieldError, fieldLabel } });
      }

      return () => {
        if (errorIsVisible && currentRef) {
          trackEvent(currentRef, 'error-clear', { componentName: 'FormField', detail: { fieldError, fieldLabel } });
        }
      };
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorText]);

  return (
    <div {...baseProps} className={clsx(baseProps.className, styles.root)} ref={__internalRootRef}>
      <div className={clsx(__hideLabel && styles['visually-hidden'])}>
        {label && (
          <label className={styles.label} id={slotIds.label} htmlFor={generatedControlId}>
            {label}
          </label>
        )}
        <InfoLinkLabelContext.Provider value={slotIds.label}>
          {!__hideLabel && info && <span className={styles.info}>{info}</span>}
        </InfoLinkLabelContext.Provider>
      </div>

      {description && (
        <div className={styles.description} id={slotIds.description}>
          {description}
        </div>
      )}

      <div className={clsx(styles.controls, __hideLabel && styles['label-hidden'])}>
        <InternalGrid gridDefinition={gridDefinition} disableGutters={__disableGutters}>
          <FormFieldContext.Provider
            value={{
              controlId: generatedControlId,
              ...contextValuesWithoutControlId,
            }}
          >
            {children && <div className={styles.control}>{children}</div>}
          </FormFieldContext.Provider>

          {secondaryControl && (
            <FormFieldContext.Provider value={contextValuesWithoutControlId}>
              <div className={styles['secondary-control']}>{secondaryControl}</div>
            </FormFieldContext.Provider>
          )}
        </InternalGrid>
      </div>

      {(constraintText || errorText) && (
        <div className={styles.hints}>
          {errorText && (
            <FormFieldError id={slotIds.error} errorIconAriaLabel={i18nStrings?.errorIconAriaLabel}>
              {errorText}
            </FormFieldError>
          )}
          {constraintText && (
            <ConstraintText id={slotIds.constraint} hasError={!!errorText}>
              {constraintText}
            </ConstraintText>
          )}
        </div>
      )}
    </div>
  );
}
