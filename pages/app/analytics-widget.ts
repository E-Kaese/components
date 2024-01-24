// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// function handleMountEvent(event: any) {
//   if (event.detail.componentName === 'Form') {
//     let formHeading;

//     if (isInComponent(event.target, 'Modal')) {
//       const modalHeaderSelector = createWrapper().findModal().findHeader().findHeader().findHeadingText().toSelector();
//       formHeading = document.querySelector(modalHeaderSelector)?.textContent ?? '';
//     } else {
//       const headingTextSelector = createWrapper().findHeader().findHeadingText().toSelector();
//       formHeading = event.target.querySelector(headingTextSelector)?.innerText ?? '';
//     }

//     if (!formHeading) {
//       const breadcrumbGroupWrapper = createWrapper().findBreadcrumbGroup().findBreadcrumbLinks().toSelector();
//       const breadcrumbLinks = document.querySelectorAll(breadcrumbGroupWrapper);
//       const lastBreadcrumb = breadcrumbLinks[breadcrumbLinks.length - 1];
//       formHeading = lastBreadcrumb.textContent ?? 'Unknown funnel';
//     }

//     const funnel = new Funnel(formHeading, 'single-page', {
//       steps: [{ name: formHeading, number: '1', config: {}, substeps: [] }],
//       optionalSteps: [],
//     });

//     const funnelId = funnel.start();
//     funnels[funnelId] = funnel;
//     funnel.setActiveStep('1');
//   }

//   if (event.detail.componentName === 'ExpandableSection') {
//     if (isInComponent(event.target, 'Form')) {
//       const expandableSectionHeaderSelector = createWrapper().findExpandableSection().findHeaderText().toSelector();
//       const expandableSectionHeader = event.target.querySelector(expandableSectionHeaderSelector).innerText;

//       const subStepNumber = funnel.activeStep!.substeps.length + 1;
//       funnel.addSubstep({ name: expandableSectionHeader, number: subStepNumber.toString(), config: {} });
//       (event.target as HTMLElement).setAttribute('data-substep-index', `${subStepNumber}`);
//     }
//   }

//   if (event.detail.componentName === 'Container') {
//     if (isInComponent(event.target, 'Form') || isInComponent(event.target, 'Wizard')) {
//       const containerHeaderSelector = createWrapper()
//         .findContainer()
//         .findHeader()
//         .findHeader()
//         .findHeadingText()
//         .toSelector();

//       const containerHeader = event.target.querySelector(containerHeaderSelector).innerText;
//       const subStepNumber = funnel.activeStep!.substeps.length + 1;
//       funnel.addSubstep({ name: containerHeader, number: subStepNumber.toString(), config: {} });

//       (event.target as HTMLElement).setAttribute('data-substep-index', `${subStepNumber}`);
//     }
//   }

//   if (event.detail.componentName === 'Wizard') {
//     const breadcrumbGroupWrapper = createWrapper().findBreadcrumbGroup().findBreadcrumbLinks().toSelector();
//     const breadcrumbLinks = document.querySelectorAll(breadcrumbGroupWrapper);
//     const lastBreadcrumb = breadcrumbLinks[breadcrumbLinks.length - 1];

//     funnel.funnelType = 'multi-page';
//     funnel.funnelName = lastBreadcrumb.textContent ?? '';
//     funnel.start();
//     funnel.steps = (event.target.__awsuiMetadata__?.componentConfiguration?.steps ?? []).map(
// (step: any, index: number) =>
//   ({
//     name: step.title,
//     number: `${index + 1}`,
//     config: {
//       isOptional: !!step.isOptional,
//     },
//     substeps: [],
//   } as FunnelStep)
//     );
//     funnel.setActiveStep('1');
//   }
// }

// document.addEventListener('awsui-wizard-step-mount', (event: any) => {
//   if (funnel.state !== 'initial') {
//     funnel.setActiveStep(event.detail.stepNumber);
//   }
// });

// document.addEventListener('awsui-wizard-step-unmount', () => {
//   funnel.setActiveStep(null);
// });

// document.addEventListener('awsui-component-mounted', (event: any) => {
//   if (!initialized) {
//     buffer.push(event);
//   } else {
//     handleMountEvent(event);
//   }

//   if (event.detail.componentName === 'AppLayout') {
//     const order = ['AppLayout', 'BreadcrumbGroup', 'Form', 'Wizard'];
//     buffer.sort((a: any, b: any) => {
//       const indexA = order.indexOf(a.detail.componentName) > -1 ? order.indexOf(a.detail.componentName) : 999;
//       const indexB = order.indexOf(b.detail.componentName) > -1 ? order.indexOf(b.detail.componentName) : 999;
//       return indexA - indexB;
//     });

//     for (const event of buffer) {
//       handleMountEvent(event);
//     }

//     initialized = true;
//   }
// });

// document.addEventListener('awsui-component-unmounted', (event: any) => {
//   if (event.detail.componentName === 'Container') {
//     if (isInComponent(event.target, 'Form') || isInComponent(event.target, 'Wizard')) {
//       if (!funnel.activeStep) {
//         return;
//       }

//       const index = funnel.activeStep.substeps.findIndex(element => element === event.target);
//       funnel.activeStep.substeps.splice(index, 1);
//     }
//   }

//   if (event.detail.componentName === 'Form') {
//     funnel.complete();
//   }
// });

// document.addEventListener('awsui-component-focus', event => {
//   if (isInComponent(event.target as HTMLElement, 'Container')) {
//     const parentContainer = findUp('Container', event.target as HTMLElement);
//     const containerIndex = parentContainer?.getAttribute('data-substep-index');
//     funnel?.setActiveSubStep(containerIndex);
//   } else if (isInComponent(event.target as HTMLElement, 'ExpandableSection')) {
//     const parentContainer = findUp('ExpandableSection', event.target as HTMLElement);
//     const containerIndex = parentContainer?.getAttribute('data-substep-index');
//     funnel?.setActiveSubStep(containerIndex);
//   } else {
//     funnel?.setActiveSubStep(null);
//   }
// });

// document.addEventListener('awsui-component-error', (event: any) => {
//   if (event.detail.componentName === 'Form') {
//     funnel.error(event.detail.errorText);
//   }

//   if (event.detail.componentName === 'FormField') {
// const formFieldWrapper = createWrapper().findFormField();
// const formFieldLabelSelector = formFieldWrapper.findLabel().toSelector();
// const formFieldLabel = event.target.querySelector(formFieldLabelSelector).textContent;

// const formFieldErrorSelector = formFieldWrapper.findError().toSelector();
// const formFieldError = event.target.querySelector(formFieldErrorSelector).textContent;

// const parentContainer =
//   findUp('Container', event.target as HTMLElement) || findUp('ExpandableSection', event.target as HTMLElement);

// const containerIndex = parentContainer?.getAttribute('data-substep-index');

// if (!containerIndex) {
//   console.error('No container index found for form field', event.target);
//   return;
// }

// funnel.subStepError(containerIndex, { label: formFieldLabel, error: formFieldError });
//   }
// });

// document.addEventListener('awsui-form-submit', () => {
//   funnel.submit();
// });

// document.addEventListener('awsui-component-click', (event: any) => {
//   if (event.detail.componentName === 'Link') {
//     if (isInComponent(event.target as HTMLElement, 'Form') || isInComponent(event.target as HTMLElement, 'Wizard')) {
//       const { variant, external } = event.detail.props;
//       const formField = findUp('FormField', event.target as HTMLElement);
//       const formFieldLabelSelector = createWrapper().findFormField().findLabel().toSelector();
//       const formFieldLabel = formField?.querySelector(formFieldLabelSelector)?.textContent ?? '';
//       const label = event.target.textContent.trim();

//       if (variant === 'info') {
//         funnel.helpLinkInteraction({ formFieldLabel, label });
//       } else if (external) {
//         funnel.externalLinkInteraction({ formFieldLabel, label });
//       }
//     }
//   }
// });

// document.addEventListener('awsui-wizard-step-change', (event: any) => {
//   if (funnel.state !== 'initial') {
//     funnel.setActiveStep(event.detail.stepIndex);
//   }
// });
