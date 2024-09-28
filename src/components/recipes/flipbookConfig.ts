export const flipbookConfig = {
    animationDuration: 250, // Custom animation time in milliseconds
    direction: 'right-to-left',  // Ensure the direction is strictly typed
    perspectiveMultiplier: 2, // Multiplier for the page flip perspective
    shadowBackground: 'rgba(0, 0, 0, 0.3)', // Shadow between page flips
    swipeLength: 400, // Swipe length before a page turns
    swipeSpeed: 0.15, // Swipe speed threshold
    disableSwipe: false, // Option to enable/disable swipe
    onAnimationEnd: () => { console.log('Animation ended'); }, // Optional: Add custom behavior
    onAnimationStart: () => { console.log('Animation started'); }, // Optional: Add custom behavior
  } as const;
  