/**
 * Auto-fill Dictation Script
 * 
 * Instructions:
 * 1. Open the Developer Tools (F12) on the browser page.
 * 2. Go to the "Console" tab.
 * 3. Copy and paste the entire code below into the console and press Enter.
 */

(function() {
    // Main function to run the logic
    function runAutoFill() {
        console.log("Starting auto-fill check...");

        // 1. Find the container with the words
        // Based on the user's description and screenshot
        const container = document.querySelector('.listen-container .listen-sen');
        
        if (!container) {
            console.log("Container not found. Retrying in 2 seconds...");
            // It might be loading
            setTimeout(runAutoFill, 2000);
            return;
        }

        // 2. Get all word elements
        const wordElements = container.querySelectorAll('.sen-wd');
        console.log(`Found ${wordElements.length} word elements.`);

        let filledCount = 0;

        wordElements.forEach((el, index) => {
            // Check if this element contains an input field
            const input = el.querySelector('input');
            
            if (input) {
                // This element has an input, so it needs to be filled.
                // We try to find the hidden answer text within the same element.
                
                // Clone the element to manipulate it without affecting the DOM yet
                const clone = el.cloneNode(true);
                
                // Remove the input element from the clone so we don't read its value
                const cloneInput = clone.querySelector('input');
                if (cloneInput) cloneInput.remove();
                
                // Get the remaining text, which should be the answer
                let answer = clone.innerText.trim();
                
                // Fallback: Check data attributes if text is empty
                if (!answer) {
                    answer = el.getAttribute('data-word') || el.getAttribute('data-answer') || el.getAttribute('data-text');
                }

                // Fallback 2: Sometimes the answer is in a specific child class like .answer or .hidden
                if (!answer) {
                    const hiddenSpan = el.querySelector('.answer, .hidden-text, span[style*="display: none"]');
                    if (hiddenSpan) answer = hiddenSpan.innerText.trim();
                }

                if (answer) {
                    console.log(`Filling input at index ${index} with answer: "${answer}"`);
                    
                    // Set the value
                    input.value = answer;
                    
                    // Dispatch events to ensure the website recognizes the input (Vue/React often need this)
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    input.dispatchEvent(new Event('blur', { bubbles: true }));
                    
                    filledCount++;
                } else {
                    console.warn(`Could not find answer text for input at index ${index}. The structure might be different.`);
                }
            }
        });

        if (filledCount > 0) {
            console.log(`Successfully filled ${filledCount} blanks!`);
            
            // Auto-jump logic
            console.log("Waiting 1.5 seconds before jumping to the next sentence...");
            setTimeout(() => {
                goToNextPage();
            }, 1500);
        } else {
            console.log("No blanks were filled. Checking if we should move to next page anyway...");
            
            // Try Strategy B (Sequence Alignment) only if we are stuck, but for now let's just try to move on
            // assuming the page might be already filled or we want to skip.
             setTimeout(() => {
                goToNextPage();
            }, 1500);
        }
    }

    function goToNextPage() {
        // Try to find the 'Next' button.
        // Heuristics based on common player controls and the screenshot (Right arrow)
        // We look for common class names or titles
        let nextBtn = document.querySelector('.next, .next-btn, .icon-next, [title="下一句"], [title="Next"], .keke-player-next');
        
        // If not found, try finding the play button and looking for the right arrow sibling
        if (!nextBtn) {
            // Look for play button
            const playBtn = document.querySelector('.play, .icon-play, .fa-play, [title="播放"]');
            if (playBtn && playBtn.parentElement) {
                // Usually the structure is [Prev] [Play] [Next]
                // So we look for the element after Play
                let sibling = playBtn.nextElementSibling;
                while (sibling) {
                    // Check if it looks like a button or icon (div, i, span, a)
                    if (['DIV', 'I', 'SPAN', 'A', 'BUTTON'].includes(sibling.tagName)) {
                        nextBtn = sibling;
                        break;
                    }
                    sibling = sibling.nextElementSibling;
                }
                
                // Sometimes the buttons are wrapped in a flex container, so playBtn might be a wrapper
                if (!nextBtn && playBtn.parentElement.nextElementSibling) {
                     // Check if the parent's sibling is the next button wrapper
                     nextBtn = playBtn.parentElement.nextElementSibling;
                }
            }
        }
        
        // Last resort: Look for any element with a right-arrow icon class
        if (!nextBtn) {
            nextBtn = document.querySelector('.fa-chevron-right, .icon-chevron-right, .fa-arrow-right');
            // If it's an icon, we might need to click its parent
            if (nextBtn && nextBtn.parentElement.tagName === 'BUTTON') {
                nextBtn = nextBtn.parentElement;
            }
        }

        if (nextBtn) {
            console.log("Found 'Next' button. Clicking...", nextBtn);
            nextBtn.click();
            
            // Wait for the next page to load and run the fill logic again
            console.log("Waiting for next page to load...");
            setTimeout(runAutoFill, 3000); 
        } else {
            console.warn("Could not find the 'Next' button. Script stopped. Please click 'Next' manually.");
        }
    }

    // Start the process
    runAutoFill();
})();
