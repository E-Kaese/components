// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';

import InternalForm from '../form/internal';
import InternalHeader from '../header/internal';
import WizardActions from './wizard-actions';
import WizardFormHeader from './wizard-form-header';

import { useMobile } from '../internal/hooks/use-mobile';
import { useEffectOnUpdate } from '../internal/hooks/use-effect-on-update';

import { WizardProps } from './interfaces';
import styles from './styles.css.js';
import { trackEvent } from '../internal/analytics';

interface WizardFormProps {
  steps: ReadonlyArray<WizardProps.Step>;
  activeStepIndex: number;
  isVisualRefresh: boolean;
  showCollapsedSteps: boolean;
  i18nStrings: WizardProps.I18nStrings;
  submitButtonText?: string;
  isPrimaryLoading: boolean;
  allowSkipTo: boolean;
  secondaryActions?: React.ReactNode;
  onCancelClick: () => void;
  onPreviousClick: () => void;
  onPrimaryClick: () => void;
  onSkipToClick: (stepIndex: number) => void;
}

export default function WizardForm({
  steps,
  activeStepIndex,
  isVisualRefresh,
  showCollapsedSteps,
  i18nStrings,
  submitButtonText,
  isPrimaryLoading,
  allowSkipTo,
  secondaryActions,
  onCancelClick,
  onPreviousClick,
  onPrimaryClick,
  onSkipToClick,
}: WizardFormProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { title, info, description, content, errorText, isOptional } = steps[activeStepIndex] || {};
  const isLastStep = activeStepIndex >= steps.length - 1;
  const skipToTargetIndex = findSkipToTargetIndex(steps, activeStepIndex);
  const isMobile = useMobile();
  const stepHeaderRef = useRef<HTMLDivElement | null>(null);

  useEffectOnUpdate(() => {
    if (stepHeaderRef && stepHeaderRef.current) {
      stepHeaderRef.current?.focus();
    }
  }, [activeStepIndex]);

  useEffect(() => {
    if (ref.current && errorText) {
      trackEvent(ref.current, 'error', {
        componentName: 'Wizard',
        detail: { errorText: 'error-text' },
      });
    }
  }, [ref, errorText]);

  const showSkipTo = allowSkipTo && skipToTargetIndex !== -1;
  const skipToButtonText =
    skipToTargetIndex !== -1 && i18nStrings.skipToButtonLabel
      ? i18nStrings.skipToButtonLabel(steps[skipToTargetIndex], skipToTargetIndex + 1)
      : undefined;

  useEffect(() => {
    if (ref.current) {
      const currentRef = ref.current;
      setTimeout(() => {
        trackEvent(currentRef, 'step-mount', {
          componentName: 'Wizard',
          detail: {
            name: steps[activeStepIndex]?.title,
            number: activeStepIndex + 1,
            isOptional: !!steps[activeStepIndex].isOptional,
          },
        });
      }, 0);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStepIndex]);

  return (
    <div ref={ref}>
      <WizardFormHeader isMobile={isMobile || showCollapsedSteps} isVisualRefresh={isVisualRefresh}>
        <div className={clsx(styles['collapsed-steps'], !showCollapsedSteps && styles['collapsed-steps-hidden'])}>
          {i18nStrings.collapsedStepsLabel?.(activeStepIndex + 1, steps.length)}
        </div>
        <InternalHeader className={styles['form-header-component']} variant="h1" description={description} info={info}>
          <span className={styles['form-header-component-wrapper']} tabIndex={-1} ref={stepHeaderRef}>
            <span>{title}</span>
            {isOptional && <i>{` - ${i18nStrings.optional}`}</i>}
          </span>
        </InternalHeader>
      </WizardFormHeader>

      <InternalForm
        className={clsx(styles['form-component'])}
        actions={
          <WizardActions
            cancelButtonText={i18nStrings.cancelButton}
            primaryButtonText={isLastStep ? submitButtonText ?? i18nStrings.submitButton : i18nStrings.nextButton}
            primaryButtonLoadingText={
              isLastStep ? i18nStrings.submitButtonLoadingAnnouncement : i18nStrings.nextButtonLoadingAnnouncement
            }
            previousButtonText={i18nStrings.previousButton}
            onCancelClick={onCancelClick}
            onPreviousClick={onPreviousClick}
            onPrimaryClick={onPrimaryClick}
            onSkipToClick={() => onSkipToClick(skipToTargetIndex)}
            showPrevious={activeStepIndex !== 0}
            isPrimaryLoading={isPrimaryLoading}
            showSkipTo={showSkipTo}
            skipToButtonText={skipToButtonText}
          />
        }
        secondaryActions={secondaryActions}
        errorText={errorText}
        errorIconAriaLabel={i18nStrings.errorIconAriaLabel}
      >
        {content}
      </InternalForm>
    </div>
  );
}

function findSkipToTargetIndex(steps: ReadonlyArray<WizardProps.Step>, activeStepIndex: number): number {
  let nextRequiredStepIndex = activeStepIndex;
  do {
    nextRequiredStepIndex++;
  } while (nextRequiredStepIndex < steps.length - 1 && steps[nextRequiredStepIndex].isOptional);

  return nextRequiredStepIndex > activeStepIndex + 1 ? nextRequiredStepIndex : -1;
}
