// ==UserScript==
// @name               Twitch - Auto Channel Points (Single Observer)
// @name:zh-TW         Twitch - 自動獲得忠誠點數 (單一觀察器)
// @namespace          http://tampermonkey.net/
// @version            2024.5.3
// @description        Automatically claim channel points using single body observer
// @description:zh-tw  使用單一 body 觀察器自動獲得忠誠點數
// @author             Long (Rewritten)
// @match              https://www.twitch.tv/*
// @icon               https://www.google.com/s2/favicons?domain=twitch.tv
// @grant              GM_addStyle
// @grant              GM_setValue
// @grant              GM_getValue
// @downloadURL https://update.greasyfork.org/scripts/435447/Twitch%20-%20Auto%20Channel%20Points.user.js
// @updateURL https://update.greasyfork.org/scripts/435447/Twitch%20-%20Auto%20Channel%20Points.meta.js
// ==/UserScript==

(function () {
    "use strict";

    GM_addStyle(`
      #total-got-points {
        display: inline-flex;
        position: relative;
        align-items: center;
        padding : 0 var(--button-padding-x) 0 var(--button-padding-x);
        text-decoration: none;
        white-space: nowrap;
        user-select: none;
        color: var(--color-text-alt-2);
        font-weight: var(--font-weight-semibold);
        border-radius: var(--border-radius-medium);
        font-size: var(--button-text-default);
        height: var(--button-size-default);
        --point-name: '自動領取忠誠點數';
      }

      #total-got-points:hover {
        background-color: var(--color-background-button-text-hover);
      }

      #total-got-points img {
        height: 2rem;
        width: 2rem;
      }

      #total-got-points img, #total-got-points svg {
        margin-right: 5px;
      }

      #total-got-points::before{
        content: var(--point-name);
        user-select: none;
        color: var(--color-text-tooltip);
        background-color: var(--color-background-tooltip);
        font-size: var(--font-size-6);
        border-radius: 0.4rem;
        padding: 0.5rem;
        max-width: 30rem;
        font-weight: var(--font-weight-semibold);
        right: 0;
        line-height: 1.2;
        pointer-events: none;
        position: absolute;
        text-align: left;
        white-space: nowrap;
        z-index: 2000;
        top: 50%;
        transform: translate(calc(100% + 5px), -50%);
        transition: all .2s ease-in-out;
        opacity: 0;
      }

      #total-got-points:hover::before{
        opacity: 1;
      }
    `);

    // Configuration
    const config = {
        ignorePathNames: ['/directory'],
        pointsRegex: /\+?(\d+)/,
        debounceDelay: 150, // 防抖延遲
    };

    // State management
    const state = {
        observer: null,
        totalPoints: 0,
        gmKeyName: '',
        isActive: false,
        debounceTimer: null,
    };

    // Initialize GM key and load saved points
    const initializePointsData = () => {
        state.gmKeyName = `${location.origin}${location.pathname}:auto-channel-points`;
        state.totalPoints = GM_getValue(state.gmKeyName, 0);
        showTotalPoints(state.totalPoints);
        console.log('[Auto-Points] Loaded points:', state.totalPoints);
    };

    // Handle points button clicks
    const handlePointsButton = (buttonElement) => {
        try {
            buttonElement.click();
            buttonElement.remove(); // Remove to prevent double-clicking
            console.log('[Auto-Points] Points button clicked');
        } catch (error) {
            console.warn('[Auto-Points] Failed to click points button:', error);
        }
    };

    // Handle points animation and update count
    const handlePointsAnimation = (animationElement) => {
        const text = animationElement.textContent || '';
        const matches = text.match(config.pointsRegex);
        
        if (matches && matches[1]) {
            const points = parseInt(matches[1], 10);
            if (points > 0) {
                state.totalPoints += points;
                GM_setValue(state.gmKeyName, state.totalPoints);
                showTotalPoints(state.totalPoints);
                console.log(`[Auto-Points] +${points} points (Total: ${state.totalPoints})`);
            }
        }
    };

    // Main mutation handler - processes all DOM changes
    const handleDOMChanges = (mutations) => {
        // Clear existing debounce timer
        if (state.debounceTimer) {
            clearTimeout(state.debounceTimer);
        }

        // Debounce to handle rapid mutations efficiently
        state.debounceTimer = setTimeout(() => {
            let processedNodes = 0;
            
            mutations.forEach(mutation => {
                if (mutation.type !== 'childList') return;
                
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType !== Node.ELEMENT_NODE) return;
                    
                    processedNodes++;
                    
                    // Check for points buttons
                    const pointsButtons = node.matches?.('[data-test-selector="community-points-summary"] button')
                        ? [node]
                        : node.querySelectorAll?.('[data-test-selector="community-points-summary"] button') || [];
                    
                    // Handle multiple buttons (claim button should be the second one)
                    if (pointsButtons.length > 1) {
                        handlePointsButton(pointsButtons[1]);
                    } else if (pointsButtons.length === 1 && pointsButtons[0].textContent.includes('領取')) {
                        handlePointsButton(pointsButtons[0]);
                    }
                    
                    // Check for points animations
                    const animations = node.matches?.('.pulse-animation')
                        ? [node]
                        : node.querySelectorAll?.('.pulse-animation') || [];
                    
                    animations.forEach(animation => {
                        if (animation.textContent.match(config.pointsRegex)) {
                            handlePointsAnimation(animation);
                        }
                    });
                    
                    // Check for chat container (for UI display)
                    if (node.querySelector?.('.chat-input__buttons-container') && !document.getElementById('total-got-points')) {
                        // Wait a bit for elements to be ready
                        setTimeout(() => showTotalPoints(state.totalPoints), 500);
                    }
                });
            });
            
            if (processedNodes > 0) {
                console.log(`[Auto-Points] Processed ${processedNodes} DOM nodes from ${mutations.length} mutations`);
            }
        }, config.debounceDelay);
    };

    // Create and setup the main observer
    const startObserver = () => {
        if (state.observer) {
            stopObserver();
        }

        state.observer = new MutationObserver(handleDOMChanges);
        state.observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        state.isActive = true;
        console.log('[Auto-Points] Single body observer started');
        
        // Initial check for existing elements
        setTimeout(() => {
            // Check for existing points buttons
            const existingButtons = document.querySelectorAll('[data-test-selector="community-points-summary"] button');
            if (existingButtons.length > 1) {
                handlePointsButton(existingButtons[1]);
            }
            
            // Ensure UI is displayed
            showTotalPoints(state.totalPoints);
        }, 1000);
    };

    // Stop the observer
    const stopObserver = () => {
        if (state.observer) {
            state.observer.disconnect();
            state.observer = null;
        }
        
        if (state.debounceTimer) {
            clearTimeout(state.debounceTimer);
            state.debounceTimer = null;
        }
        
        state.isActive = false;
        console.log('[Auto-Points] Observer stopped');
    };

    // Create and append points display element
    const createPointsDisplay = () => {
        if (document.getElementById('total-got-points')) {
            return document.querySelector('#total-got-points span');
        }

        const container = document.createElement('div');
        container.id = 'total-got-points';
        
        const buttonContainer = document.querySelector('.chat-input__buttons-container div');
        if (!buttonContainer) return null;
        
        buttonContainer.appendChild(container);
        
        // Add icon
        const pointImage = document.querySelector('.channel-points-icon__image');
        if (pointImage) {
            const pointName = pointImage.alt || '忠誠點數';
            container.style.setProperty('--point-name', `"自動領取${pointName}"`);
            container.appendChild(pointImage.cloneNode(true));
        } else {
            const svg = document.querySelector('.chat-input__buttons-container button svg');
            if (svg) {
                container.appendChild(svg.cloneNode(true));
            }
        }
        
        // Add text span
        const textSpan = document.createElement('span');
        container.appendChild(textSpan);
        
        return textSpan;
    };

    // Update points display
    const showTotalPoints = (points) => {
        let displayElement = document.querySelector('#total-got-points span');
        
        if (!displayElement) {
            displayElement = createPointsDisplay();
        }
        
        if (displayElement) {
            displayElement.textContent = new Intl.NumberFormat().format(points);
        }
    };

    // Check if current path should be ignored
    const shouldIgnorePath = (pathname) => {
        return config.ignorePathNames.some(ignored => pathname.startsWith(ignored));
    };

    // Handle page navigation
    const handlePageChange = () => {
        const currentPath = location.pathname;
        
        if (shouldIgnorePath(currentPath)) {
            console.log('[Auto-Points] Ignoring path:', currentPath);
            stopObserver();
            return;
        }
        
        // Reinitialize for new page
        initializePointsData();
        
        if (!state.isActive) {
            startObserver();
        }
    };

    // Setup navigation listener
    const setupNavigation = () => {
        if (window.navigation) {
            window.navigation.addEventListener('navigate', (event) => {
                stopObserver();
                
                // Handle navigation after a short delay
                setTimeout(() => {
                    const url = new URL(event.destination.url);
                    if (!shouldIgnorePath(url.pathname)) {
                        handlePageChange();
                    }
                }, 200);
            });
        }
    };

    // Main initialization function
    const initialize = () => {
        console.log('[Auto-Points] Script initializing...');
        
        // Skip if on ignored path
        if (shouldIgnorePath(location.pathname)) {
            console.log('[Auto-Points] Current path ignored');
            return;
        }
        
        // Initialize points data
        initializePointsData();
        
        // Start observing
        startObserver();
        
        // Setup navigation handling
        setupNavigation();
        
        console.log('[Auto-Points] Script initialized successfully');
    };

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        stopObserver();
    });

    // Start the script
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();
