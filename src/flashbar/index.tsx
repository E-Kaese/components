// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import clsx from 'clsx';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { applyDisplayName } from '../internal/utils/apply-display-name';
import customCssProps from '../internal/generated/custom-css-properties';
import { Flash, focusFlashById } from './flash';
import { FlashbarProps, StackedFlashbarProps } from './interfaces';
import { getBaseProps } from '../internal/base-component';
import InternalIcon from '../icon/internal';
import { TIMEOUT_FOR_ENTERING_ANIMATION } from './constant';
import { TransitionGroup } from 'react-transition-group';
import { Transition } from '../internal/components/transition';
import useBaseComponent from '../internal/hooks/use-base-component';
import { useContainerBreakpoints } from '../internal/hooks/container-queries';
import useFocusVisible from '../internal/hooks/focus-visible';
import { useMergeRefs } from '../internal/hooks/use-merge-refs';
import { useReducedMotion, useVisualRefresh } from '../internal/hooks/use-visual-mode';
import { getVisualContextClassname } from '../internal/components/visual-context';

import styles from './styles.css.js';
import { getStackedItems, StackableItem } from './utils';
import { animate, getDOMRects } from '../internal/animate';

export { FlashbarProps };

const maxUnstackedItems = 1;

export default function Flashbar({ items, ...restProps }: FlashbarProps) {
  const { __internalRootRef } = useBaseComponent('Flashbar');
  const baseProps = getBaseProps(restProps);

  const ref = useRef<HTMLDivElement | null>(null);
  const [breakpoint, breakpointRef] = useContainerBreakpoints(['xs']);
  const mergedRef = useMergeRefs(ref, breakpointRef, __internalRootRef);

  const isFocusVisible = useFocusVisible();
  const isVisualRefresh = useVisualRefresh();

  /**
   * The `stackItems` property is a hidden boolean that allows for teams
   * to beta test the flashbar stacking feature.
   */
  const stackItems = isStackedFlashbar(restProps);

  const [previousItems, setPreviousItems] = useState<ReadonlyArray<FlashbarProps.MessageDefinition>>(items);
  const [nextFocusId, setNextFocusId] = useState<string | null>(null);
  const [enteringItems, setEnteringItems] = useState<ReadonlyArray<FlashbarProps.MessageDefinition>>([]);
  const [exitingItems, setExitingItems] = useState<ReadonlyArray<FlashbarProps.MessageDefinition>>([]);

  const collapsedItemRefs = useRef<Record<string | number, HTMLElement | null>>({});
  const expandedItemRefs = useRef<Record<string | number, HTMLElement | null>>({});
  const [initialAnimationState, setInitialAnimationState] = useState<Record<string | number, DOMRect> | null>(null);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const [toggleButtonRect, setToggleButtonRect] = useState<DOMRect>();
  const [transitioning, setTransitioning] = useState(false);
  const [isFlashbarStackExpanded, setIsFlashbarStackExpanded] = useState(false);

  const isReducedMotion = useReducedMotion(breakpointRef as any);
  const allItemsHaveId = useMemo(() => items.every(item => 'id' in item), [items]);

  const prepareAnimations = useCallback(() => {
    if (isReducedMotion) {
      return;
    }
    const oldElements = isFlashbarStackExpanded ? expandedItemRefs.current : collapsedItemRefs.current;
    const rects = getDOMRects(oldElements);
    setInitialAnimationState(rects);
    setToggleButtonRect(toggleButtonRef.current?.getBoundingClientRect());
  }, [isFlashbarStackExpanded, isReducedMotion]);

  // Track new or removed item IDs in state to only trigger focus changes for newly added items.
  // https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops
  if (items) {
    const newItems = items.filter(({ id }) => id && !previousItems.some(item => item.id === id));
    const removedItems = previousItems.filter(({ id }) => id && !items.some(item => item.id === id));
    if (newItems.length > 0 || removedItems.length > 0) {
      setPreviousItems(items);
      setEnteringItems([...enteringItems, ...newItems]);
      setExitingItems([...exitingItems, ...removedItems]);
      const newFocusItems = newItems.filter(({ ariaRole }) => ariaRole === 'alert');
      if (newFocusItems.length > 0) {
        setNextFocusId(newFocusItems[0].id!);
      }
      // If not all items have ID, we can still animate collapse/expand transitions
      // because we can rely on each item's index in the original array,
      // but we can't do that when elements are added or removed, since the index changes.
      if (allItemsHaveId) {
        prepareAnimations();
      }
    }
  }

  useEffect(() => {
    if (nextFocusId) {
      focusFlashById(ref.current, nextFocusId);
    }
  }, [nextFocusId]);

  useEffect(() => {
    if (items.length <= maxUnstackedItems) {
      setIsFlashbarStackExpanded(false);
    }
  }, [items.length]);

  /**
   * All the flash items should have ids so we can identify which DOM element is being
   * removed from the DOM to animate it. Motion will be disabled if any of the provided
   * flash messages does not contain an `id`.
   */
  const motionDisabled = isReducedMotion || !isVisualRefresh || !allItemsHaveId;

  const animateFlash = !isReducedMotion && (isVisualRefresh || stackItems);

  function toggleCollapseExpand() {
    prepareAnimations();
    setIsFlashbarStackExpanded(!isFlashbarStackExpanded);
  }

  useLayoutEffect(() => {
    // When `useLayoutEffect` is called, the DOM is updated but has not been painted yet. So it's a good moment to trigger animations
    // that will make calculations based on old and new DOM state.
    // The old state is kept in `oldStateDOMRects` (notification items) and `toggleButtonRect` (toggle button),
    // and the new state can be retrieved from the current DOM elements.
    if (initialAnimationState) {
      const elements = isFlashbarStackExpanded ? expandedItemRefs.current : collapsedItemRefs.current;

      // But first, hide elements that will not be present in the final state but they are still present now
      // because they are managed by ReactTransition, which removes them at a later point after the first render.
      let parent;
      for (const id in elements) {
        parent = elements[id]?.parentElement;
        if (parent) {
          break;
        }
      }
      if (parent?.hasChildNodes()) {
        const set = new Set<Node>();
        for (const id in elements) {
          const element = elements[id];
          if (element !== null) {
            set.add(element);
          }
        }
        parent.childNodes.forEach(child => {
          if (!set.has(child) && child instanceof HTMLElement) {
            child.style.display = 'none';
          }
        });
      }

      animate({
        elements,
        oldState: initialAnimationState,
        newElementInitialState: ({ top }) => ({ scale: 0.9, y: -0.2 * top }),
        onTransitionsEnd: () => setTransitioning(false),
      });
      if (toggleButtonRect && toggleButtonRef) {
        animate({
          elements: {
            toggleButton: toggleButtonRef.current,
          },
          oldState: { toggleButton: toggleButtonRect },
        });
      }
      setTransitioning(true);
      setInitialAnimationState(null);
    }
  }, [isFlashbarStackExpanded, initialAnimationState, toggleButtonRect]);

  /**
   * If the `isFlashbarStacked` is true (which is only possible if `stackItems` is true)
   * then the first item should be rendered followed by two dummy items that visually indicate
   * two, three, or more items exist in the stack.
   */
  function renderStackedItems() {
    if (!stackItems) {
      return;
    }

    // When using the stacking feature, the items are shown in reverse order (last item on top)
    const reversedItems = items.slice().reverse();

    const stackDepth = Math.min(3, items.length);

    const itemsToShow = isFlashbarStackExpanded
      ? reversedItems.map((item, index) => ({ ...item, expandedIndex: index }))
      : getStackedItems(reversedItems, stackDepth).map((item, index) => ({ ...item, collapsedIndex: index }));

    const { i18nStrings } = restProps as StackedFlashbarProps;
    const toggleButtonText = i18nStrings?.toggleButtonText(items.length);

    const toggleButtonAriaLabel = isFlashbarStackExpanded
      ? i18nStrings?.collapseButtonAriaLabel
      : i18nStrings?.expandButtonAriaLabel(items.length);

    const getItemId = (item: StackableItem | FlashbarProps.MessageDefinition) =>
      item.id ?? (item as StackableItem).expandedIndex ?? 0;

    // This check allows us to use the standard "enter" Transition only when the notification was not existing before.
    // If instead it was moved to the top of the stack but was already present in the array
    // (e.g, after dismissing another notification),
    // we need to use different, more custom and more controlled animations.
    const hasEntered = (item: StackableItem | FlashbarProps.MessageDefinition) =>
      enteringItems.some(_item => _item.id && _item.id === item.id);
    const hasLeft = (item: StackableItem | FlashbarProps.MessageDefinition) => !('expandedIndex' in item);
    const hasEnteredOrLeft = (item: StackableItem | FlashbarProps.MessageDefinition) =>
      hasEntered(item) || hasLeft(item);

    const showInnerContent = (item: StackableItem | FlashbarProps.MessageDefinition) =>
      isFlashbarStackExpanded || hasLeft(item) || ('expandedIndex' in item && item.expandedIndex === 0);

    const shouldUseStandardAnimation = (item: StackableItem, index: number) => index === 0 && hasEnteredOrLeft(item);

    return (
      <>
        <TransitionGroup
          component="ul"
          className={clsx(
            styles['flash-list'],
            isFlashbarStackExpanded ? styles.expanded : styles.collapsed,
            transitioning && styles.transitioning,
            isVisualRefresh && styles['visual-refresh']
          )}
          style={
            !isFlashbarStackExpanded || transitioning
              ? {
                  [customCssProps.flashbarStackDepth]: stackDepth,
                }
              : undefined
          }
        >
          {itemsToShow.map((item, index) => (
            <Transition
              key={getItemId(item)}
              in={!hasLeft(item)}
              onStatusChange={status => {
                if (status === 'entered') {
                  setEnteringItems([]);
                } else if (status === 'exited') {
                  setExitingItems([]);
                }
              }}
            >
              {(state: string, transitionRootElement: React.Ref<HTMLDivElement> | undefined) => (
                <li
                  className={
                    showInnerContent(item)
                      ? clsx(styles['flash-list-item'], !isFlashbarStackExpanded && styles.item)
                      : clsx(styles.flash, styles[`flash-type-${item.type ?? 'info'}`], styles.item)
                  }
                  ref={element => {
                    if (isFlashbarStackExpanded) {
                      expandedItemRefs.current[getItemId(item)] = element;
                    } else {
                      collapsedItemRefs.current[getItemId(item)] = element;
                    }
                  }}
                  style={
                    !isFlashbarStackExpanded || transitioning
                      ? {
                          [customCssProps.flashbarStackIndex]:
                            (item as StackableItem).collapsedIndex ?? (item as StackableItem).expandedIndex ?? index,
                        }
                      : undefined
                  }
                  key={getItemId(item)}
                >
                  {showInnerContent(item) &&
                    renderItem(
                      item,
                      getItemId(item),
                      shouldUseStandardAnimation(item, index) ? transitionRootElement : undefined,
                      shouldUseStandardAnimation(item, index) ? state : undefined
                    )}
                </li>
              )}
            </Transition>
          ))}
        </TransitionGroup>

        {items.length > maxUnstackedItems && (
          <button
            aria-label={toggleButtonAriaLabel}
            className={clsx(
              styles.toggle,
              isVisualRefresh && styles['visual-refresh'],
              isFlashbarStackExpanded ? styles.expanded : styles.collapsed,
              transitioning && styles.transitioning
            )}
            onClick={toggleCollapseExpand}
            ref={toggleButtonRef}
            {...isFocusVisible}
          >
            {toggleButtonText && <span>{toggleButtonText}</span>}
            <span className={clsx(styles.icon, isFlashbarStackExpanded && styles.expanded)}>
              <InternalIcon size="normal" name="angle-down" />
            </span>
          </button>
        )}
      </>
    );
  }

  /**
   * If the flashbar is flat and motion is `enabled` then the adding and removing of items
   * from the flashbar will render with visual transitions.
   */
  function renderFlatItemsWithTransitions() {
    if (stackItems || motionDisabled || !items) {
      return;
    }

    return (
      // This is a proxy for <ul>, so we're not applying a class to another actual component.
      // eslint-disable-next-line react/forbid-component-props
      <TransitionGroup component="ul" className={styles['flash-list']}>
        {items &&
          items.map((item, index) => (
            <Transition
              transitionChangeDelay={{ entering: TIMEOUT_FOR_ENTERING_ANIMATION }}
              key={item.id ?? index}
              in={true}
            >
              {(state: string, transitionRootElement: React.Ref<HTMLDivElement> | undefined) => (
                <li className={styles['flash-list-item']}>
                  {renderItem(item, item.id ?? index, transitionRootElement, state)}
                </li>
              )}
            </Transition>
          ))}
      </TransitionGroup>
    );
  }

  /**
   * If the flashbar is flat and motion is `disabled` then the adding and removing of items
   * from the flashbar will render without visual transitions.
   */
  function renderFlatItemsWithoutTransitions() {
    if (stackItems || !motionDisabled || !items) {
      return;
    }

    return (
      <ul className={styles['flash-list']}>
        {items.map((item, index) => (
          <li key={item.id ?? index} className={styles['flash-list-item']}>
            {renderItem(item, item.id ?? index)}
          </li>
        ))}
      </ul>
    );
  }

  /**
   * This is a shared render function for a single flashbar item to be used
   * by the stacking, motion, and non-motion item group render functions.
   */
  function renderItem(
    item: FlashbarProps.MessageDefinition,
    key: string | number,
    transitionRootElement?: React.Ref<HTMLDivElement> | undefined,
    transitionState?: string | undefined
  ) {
    return (
      <Flash
        // eslint-disable-next-line react/forbid-component-props
        className={clsx(
          getVisualContextClassname('flashbar'),
          animateFlash && styles['flash-with-motion'],
          isVisualRefresh && styles['flash-refresh']
        )}
        key={key}
        ref={transitionRootElement}
        transitionState={transitionState}
        {...item}
      />
    );
  }

  return (
    <div
      {...baseProps}
      className={clsx(
        baseProps.className,
        styles.flashbar,
        styles[`breakpoint-${breakpoint}`],
        stackItems && styles.stack
      )}
      ref={mergedRef}
    >
      {renderStackedItems()}
      {renderFlatItemsWithTransitions()}
      {renderFlatItemsWithoutTransitions()}
    </div>
  );
}

function isStackedFlashbar(props: any): props is StackedFlashbarProps {
  return 'stackItems' in props && !!props.stackItems;
}

applyDisplayName(Flashbar, 'Flashbar');
