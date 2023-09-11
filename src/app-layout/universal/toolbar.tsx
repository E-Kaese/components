// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import clsx from 'clsx';
import { useAppLayoutInternals } from '../visual-refresh/context';
import styles from './styles.css.js';

export default function Toolbar() {
  const { breadcrumbs } = useAppLayoutInternals();

  let previousScrollPosition = window.pageYOffset;

  window.onscroll = function handleToolbarStyles() {
    let currentScrollPosition = window.pageYOffset;
    const background = document.getElementById('background');
    const toolbar = document.getElementById('toolbar');

    if (background && toolbar) {
      if (previousScrollPosition > currentScrollPosition) {
        toolbar.style.top = '38px';
        toolbar.style.opacity = '1';
        background.style.opacity = '1';
      } else {
        toolbar.style.top = '-60px';
        toolbar.style.opacity = '0';
        background.style.opacity = '0';
      }
    }
    
    previousScrollPosition = currentScrollPosition;
  }

  return (
    <section id="toolbar" className={clsx(styles.toolbar, 'awsui-context-content-header')}>
      <div className={styles.container}>
        <div className={styles['actions-inline-start']}>
          <button className={styles.button}>
            <svg width="11" viewBox="0 0 11 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M0.122864 1.41375C0.122864 0.993505 0.463537 0.652832 0.883778 0.652832H9.96943C10.3897 0.652832 10.7303 0.993505 10.7303 1.41375C10.7303 1.83399 10.3897 2.17466 9.96942 2.17466H0.883778C0.463537 2.17466 0.122864 1.83399 0.122864 1.41375ZM0.122864 5.21832C0.122864 4.79808 0.463537 4.45741 0.883778 4.45741H9.96943C10.3897 4.45741 10.7303 4.79808 10.7303 5.21832C10.7303 5.63856 10.3897 5.97924 9.96942 5.97924H0.883778C0.463537 5.97924 0.122864 5.63856 0.122864 5.21832ZM0.883778 8.26198C0.463537 8.26198 0.122864 8.60265 0.122864 9.02289C0.122864 9.44314 0.463537 9.78381 0.883778 9.78381H9.96942C10.3897 9.78381 10.7303 9.44314 10.7303 9.02289C10.7303 8.60265 10.3897 8.26198 9.96943 8.26198H0.883778Z" fill="white"/>
            </svg>
          </button>
        </div>

        <div className={styles.breadcrumbs}>
          {breadcrumbs}
        </div>

        <div className={styles['actions-inline-end']}>
          <button className={styles.button}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M11.2658 4.49834C11.0068 4.46985 10.7845 4.30074 10.681 4.04162C10.5772 3.79874 10.6179 3.51822 10.7864 3.31482C11.0069 3.04863 11.017 2.66619 10.8107 2.3888C10.4616 1.9194 10.0458 1.50358 9.57639 1.15452C9.2969 0.946669 8.91109 0.958601 8.64497 1.18332C8.44596 1.35137 8.17052 1.396 7.92864 1.2994C7.68676 1.2028 7.51784 0.9807 7.48935 0.721802C7.45194 0.381934 7.1894 0.110386 6.85099 0.0615401C6.28251 -0.0205134 5.70519 -0.0205134 5.1367 0.0615401C4.79433 0.110957 4.53017 0.388125 4.49725 0.732475C4.47232 0.993315 4.30477 1.21881 4.06223 1.31796C3.81968 1.41711 3.54216 1.37357 3.34163 1.2049C3.07549 0.981031 2.69037 0.969489 2.4113 1.17702C1.94191 1.52608 1.52608 1.94191 1.17702 2.4113C0.969489 2.69037 0.981031 3.07549 1.2049 3.34163C1.37357 3.54216 1.41711 3.81968 1.31796 4.06223C1.21881 4.30477 0.993315 4.47232 0.732475 4.49725C0.388125 4.53017 0.110957 4.79433 0.0615401 5.1367C-0.0205134 5.70519 -0.0205134 6.28251 0.0615401 6.85099C0.110831 7.19249 0.38675 7.45629 0.730113 7.49021C0.988837 7.51577 1.2125 7.68165 1.31206 7.92182C1.41162 8.16198 1.37092 8.43745 1.20617 8.63857C0.988088 8.90478 0.97916 9.28525 1.18452 9.56139C1.53358 10.0308 1.9494 10.4466 2.4188 10.7957C2.69621 11.002 3.07869 10.9919 3.34488 10.7713C3.54647 10.6043 3.82402 10.5627 4.06571 10.6634C4.30739 10.764 4.47341 10.9903 4.49686 11.251C4.52799 11.5971 4.79278 11.8765 5.1367 11.9262C5.70519 12.0082 6.28251 12.0082 6.85099 11.9262C7.19249 11.8769 7.45629 11.6009 7.49021 11.2576C7.51577 10.9989 7.68165 10.7752 7.92182 10.6756C8.16198 10.5761 8.43745 10.6168 8.63857 10.7815C8.90478 10.9996 9.28525 11.0085 9.56139 10.8032C10.0308 10.4541 10.4466 10.0383 10.7957 9.56889C11.002 9.29149 10.9919 8.90901 10.7713 8.64282C10.6043 8.44123 10.5627 8.16368 10.6634 7.92199C10.764 7.6803 10.9903 7.51429 11.251 7.49083C11.5971 7.4597 11.8765 7.19491 11.9262 6.85099C12.0082 6.28251 12.0082 5.70519 11.9262 5.1367C11.8773 4.79827 11.6057 4.53573 11.2658 4.49834ZM9.05815 2.67169C9.14054 2.7482 9.22003 2.82778 9.29647 2.91024C9.06971 3.44993 9.0635 4.0673 9.29809 4.62261C9.52064 5.17423 9.95221 5.60371 10.4847 5.82875C10.4886 5.93572 10.4887 6.04281 10.485 6.14979C9.94745 6.36801 9.50837 6.79365 9.27863 7.34538C9.04836 7.89836 9.05614 8.51137 9.28144 9.04749C9.20345 9.13163 9.12227 9.21276 9.03808 9.2907C8.50486 9.06914 7.89661 9.0623 7.34738 9.28999C6.79879 9.51741 6.37413 9.95185 6.15385 10.4848C6.04857 10.4886 5.94319 10.4886 5.83791 10.485C5.61969 9.94745 5.19404 9.50837 4.64232 9.27863C4.08934 9.04836 3.47632 9.05614 2.94021 9.28144C2.85607 9.20345 2.77493 9.12227 2.69699 9.03808C2.91855 8.50486 2.92539 7.89661 2.69771 7.34738C2.47029 6.79879 2.03584 6.37413 1.50285 6.15385C1.49907 6.0477 1.49905 5.94146 1.50279 5.83531C2.0412 5.61422 2.47955 5.1848 2.70642 4.62984C2.93276 4.07618 2.92136 3.46425 2.69359 2.9302C2.7695 2.84842 2.84842 2.7695 2.9302 2.69359C3.46425 2.92136 4.07618 2.93276 4.62984 2.70642C5.1848 2.47955 5.61422 2.0412 5.83531 1.50279C5.94317 1.49899 6.05113 1.49907 6.15898 1.50303C6.38501 2.03775 6.81723 2.47073 7.37231 2.69241C7.92287 2.91229 8.52902 2.89822 9.05815 2.67169ZM6 8.25C4.75736 8.25 3.75 7.24264 3.75 6C3.75 4.75736 4.75736 3.75 6 3.75C7.24264 3.75 8.25 4.75736 8.25 6C8.25 7.24264 7.24264 8.25 6 8.25ZM6.75 6C6.75 6.41421 6.41421 6.75 6 6.75C5.58579 6.75 5.25 6.41421 5.25 6C5.25 5.58579 5.58579 5.25 6 5.25C6.41421 5.25 6.75 5.58579 6.75 6Z" fill="white"/>
            </svg>
          </button>

          <button className={styles.button}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M0.0794385 8.961C0.206189 9.21525 0.465688 9.375 0.749938 9.375H3.50019V9.50025C3.50019 10.8555 4.64469 12 5.99994 12C7.35519 12 8.50044 10.8555 8.50044 9.50025V9.375H11.2499C11.5342 9.375 11.7937 9.21525 11.9212 8.961C12.0479 8.70675 12.0209 8.403 11.8499 8.17575L9.36819 4.866C9.29844 3.5145 8.67369 1.4025 6.74994 0.96225V0.75C6.74994 0.336 6.41394 0 5.99994 0C5.58594 0 5.24994 0.336 5.24994 0.75V0.96225C3.32694 1.4025 2.70219 3.5145 2.63169 4.866L0.149939 8.17575C-0.0203115 8.403 -0.0480615 8.70675 0.0794385 8.961ZM3.97494 5.57475C4.07244 5.445 4.12494 5.2875 4.12494 5.12475C4.12494 5.013 4.14669 2.37525 5.99994 2.37525C7.83894 2.37525 7.87419 5.0145 7.87494 5.12475C7.87494 5.2875 7.92819 5.445 8.02494 5.57475L9.74994 7.875H2.24994L3.97494 5.57475ZM5.99994 10.5C6.53319 10.5 7.00044 10.0328 7.00044 9.50025V9.375H5.00019V9.50025C5.00019 10.0328 5.46744 10.5 5.99994 10.5Z" fill="white"/>
            </svg>
          </button>

          <button className={styles.button}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M0 6C0 9.31371 2.68629 12 6 12C9.31371 12 12 9.31371 12 6C12 2.68629 9.31371 0 6 0C2.68629 0 0 2.68629 0 6ZM10.5 6C10.5 8.48528 8.48528 10.5 6 10.5C3.51472 10.5 1.5 8.48528 1.5 6C1.5 3.51472 3.51472 1.5 6 1.5C8.48528 1.5 10.5 3.51472 10.5 6ZM5.25 6.75V7.5H4.5V9H5.25H6.75H7.5V7.5H6.75V5.25H6H5.25H4.5V6.75H5.25ZM6.75 4.5V3H5.25V4.5H6.75Z" fill="white"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
