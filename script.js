// DOM Elements
const chatBox = document.getElementById('chatBox');
const sendButton = document.getElementById('sendButton');
const userInput = document.getElementById('userInput');
const clearChatBtn = document.getElementById('clear-chat-btn');
const settingsBtn = document.getElementById('settings-btn');
const moreBtn = document.getElementById('more-btn');
const themeToggleButton = document.querySelector('.theme-toggle');
let stopGenerating = false;

// Event Listeners for Page Load
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 1000,
        once: true
    });
    setupPageLoader();
    setupAnimationObserver();
    setupMobileMenu();
    initializeChatInterface();
});

// Page Loader Setup
function setupPageLoader() {
    const pageLoader = document.querySelector('.page-loader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            pageLoader.classList.add('loaded');
            document.body.classList.remove('loading');
            pageLoader.style.display = 'none';
        }, 500);
    });
}

// Animation Observer Setup
function setupAnimationObserver() {
    const animateElements = document.querySelectorAll('.animate-in');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    animateElements.forEach(element => observer.observe(element));
}

// Mobile Menu Setup
function setupMobileMenu() {
    const mobileMenuButton = document.querySelector('.mobile-menu');
    const mobileNav = document.querySelector('.mobile-nav');

    mobileMenuButton?.addEventListener('click', () => {
        mobileNav.classList.toggle('active');
        mobileMenuButton.classList.toggle('active');
    });
}

// Chat Interface Initialization
function initializeChatInterface() {
    setupChatControls();
    setupDialogControls();
    setupAdditionalFeatures();
}

// Chat Controls Setup
function setupChatControls() {
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    sendButton.addEventListener('click', sendMessage);

    themeToggleButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });

    document.getElementById('getStartedLink')?.addEventListener('click', function(event) {
        event.preventDefault();
        const chatInput = document.querySelector('.hero-actions');
        setTimeout(() => chatInput.classList.add('show'), 200);
        setTimeout(() => chatInput.scrollIntoView({ behavior: 'smooth' }), 500);
    });

    // Add event listener for the stop button
    document.getElementById('stop-button').addEventListener('click', () => {
        stopGenerating = true;
    });
}

// Message Handling Functions
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addChatBubble(message, 'user');
    userInput.value = '';

    // Reset stop flag for the new interaction
    stopGenerating = false;

    const greetings = ['hey', 'hi', 'hello', 'hey matty', 'matty hi'];
    const lowerMessage = message.toLowerCase();

    if (greetings.some(greeting => lowerMessage.includes(greeting))) {
        addChatBubble("👋 Hello! I'm Matty, your AI companion. How can I assist you today?", 'ai');
    } else {
        const aiResponse = await getAIResponse(message);
        addChatBubble(aiResponse, 'ai');
    }
}

async function getAIResponse(userMessage) {
    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userMessage })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            return "Error: " + (errorData.details || errorData.error);
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error('Error:', error);
        return "There was an error communicating with the server.";
    }
}

// Chat Box Setup / AI reply Smoothness Improvement
async function addChatBubble(message, sender) {
    const bubble = document.createElement('div');
    bubble.classList.add('chat-bubble', sender === 'user' ? 'user-bubble' : 'ai-bubble');

    if (sender === 'user') {
        bubble.textContent = message;
        chatBox.appendChild(bubble);
        chatBox.scrollTop = chatBox.scrollHeight;
    } else {
        const typingBubble = document.createElement('div');
        typingBubble.classList.add('typing-animation');
        typingBubble.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
        bubble.appendChild(typingBubble);
        chatBox.appendChild(bubble);
        chatBox.scrollTop = chatBox.scrollHeight;

        await new Promise(resolve => setTimeout(resolve, 1000));

        bubble.innerHTML = '';
        let currentText = '';
        for (let i = 0; i < message.length; i++) {
            if (stopGenerating) break; // Check if generation should stop
            currentText += message[i];
            bubble.innerHTML = formatAIMessage(currentText);
            chatBox.scrollTop = chatBox.scrollHeight;
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        if (stopGenerating) {
            bubble.innerHTML += '<span class="stopped">[Stopped]</span>';
        } else {
            bubble.innerHTML = formatAIMessage(message); // Complete the message if not stopped
        }
    }

    if (sender === 'ai') {
        const timestamp = document.createElement('span');
        timestamp.classList.add('timestamp');
        timestamp.textContent = new Date().toLocaleTimeString();
        await handleAIMessage(bubble, message, timestamp);
    }
}

async function handleAIMessage(bubble, message, timestamp) {
    const typingIndicator = createTypingIndicator();
    bubble.appendChild(typingIndicator);
    chatBox.appendChild(bubble);
    bubble.scrollIntoView({ behavior: 'smooth', block: 'center' });

    await animateTyping(bubble, message);
    
    bubble.innerHTML = formatAIMessage(message);
    addMessageActions(bubble);
    bubble.appendChild(timestamp);
    bubble.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

// Dialog Controls Setup
function setupDialogControls() {
    clearChatBtn?.addEventListener('click', showClearChatDialog);
    settingsBtn?.addEventListener('click', showSettingsDialog);
    moreBtn?.addEventListener('click', showMoreOptionsDialog);
}

// Additional Features Setup
function setupAdditionalFeatures() {
    document.querySelector('[aria-label="Emoji"]')?.addEventListener('click', showEmojiPicker);
    document.querySelector('[aria-label="Voice"]')?.addEventListener('click', handleVoiceInput);
    document.querySelector('[aria-label="Attach file"]')?.addEventListener('click', handleFileAttachment);
}

// Utility Functions
function formatAIMessage(message) {
    return message
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/_(.*?)_/g, '<u>$1</u>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/~(.*?)~/g, '<del>$1</del>')
        .replace(/:\)/g, '😊')
        .replace(/:\(/g, '😢')
        .replace(/:D/g, '😃')
        .replace(/;\)/g, '😉')
        .replace(/<3/g, '❤️')
        .replace(/:\)/g, '💕');
}

function createTypingIndicator() {
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('typing-indicator');
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        typingIndicator.appendChild(dot);
    }
    return typingIndicator;
}

async function animateTyping(bubble, message) {
    let displayText = '';
    const formattedMessage = formatAIMessage(message);

    for (let i = 0; i < formattedMessage.length && !stopGenerating; i++) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 30 + 20));
        displayText += formattedMessage[i];
        bubble.innerHTML = displayText;
        bubble.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
    }

    if (stopGenerating) {
        bubble.innerHTML += '<span class="stopped">[Stopped]</span>';
    } else {
        bubble.innerHTML = formattedMessage; // Complete the message if not stopped
    }
}

// Add Message Actions
function addMessageActions(bubble) {
    const messageInfo = document.createElement('div');
    messageInfo.classList.add('message-info');

    const messageActions = document.createElement('div');
    messageActions.classList.add('message-actions');

    // Copy button
    const copyButton = createActionButton('far fa-copy', 'Copy', () => {
        navigator.clipboard.writeText(bubble.textContent).then(() => {
            alert('Message copied to clipboard!');
        });
    });

    // React button
    const reactButton = createActionButton('far fa-heart', 'React', (button) => {
        button.classList.toggle('reacted');
        button.innerHTML = button.classList.contains('reacted') ? 
            '<i class="fas fa-heart"></i>' : 
            '<i class="far fa-heart"></i>';
    });

    messageActions.appendChild(copyButton);
    messageActions.appendChild(reactButton);
    messageInfo.appendChild(messageActions);
    bubble.appendChild(messageInfo);
}

function createActionButton(iconClass, label, onClick) {
    const button = document.createElement('button');
    button.classList.add('btn-icon-sm', 'ripple-effect');
    button.setAttribute('aria-label', label);
    button.innerHTML = `<i class="${iconClass}"></i>`;
    button.addEventListener('click', () => onClick(button));
    return button;
}

// Dialog Creation Functions
function showClearChatDialog() {
    const dialog = createDialog(`
        <p>Are you sure you want to delete this chat?</p>
        <button id="confirm-yes" class="dialog-btn">Yes</button>
        <button id="confirm-no" class="dialog-btn">No</button>
    `);

    dialog.querySelector('#confirm-yes').addEventListener('click', () => {
        chatBox.innerHTML = `
            <div class="message-bubble typing-effect">
                <p>Start typing to talk with <b>Matty AI <i class="fas fa-robot"></i></b></p>
            </div>
        `;
        document.body.removeChild(dialog);
    });

    dialog.querySelector('#confirm-no').addEventListener('click', () => {
        document.body.removeChild(dialog);
    });
}

function showSettingsDialog() {
    const dialog = createDialog(`
        <h3>Settings</h3>
        <ul style="list-style: none; padding: 0;">
            <li style="padding: 8px 0;">Theme Settings</li>
            <li style="padding: 8px 0;">Chat History</li>
            <li style="padding: 8px 0;">Notifications</li>
        </ul>
        <button id="settings-close" class="dialog-btn">Close</button>
    `);

    dialog.querySelector('#settings-close').addEventListener('click', () => {
        document.body.removeChild(dialog);
    });
}

function showMoreOptionsDialog() {
    const dialog = createDialog(`
        <h3>More Options</h3>
        <ul style="list-style: none; padding: 0;">
            <li style="padding: 8px 0;">Export Chat</li>
            <li style="padding: 8px 0;">Share Conversation</li>
            <li style="padding: 8px 0;">Report Issue</li>
        </ul>
        <button id="more-close" class="dialog-btn">Close</button>
    `);

    dialog.querySelector('#more-close').addEventListener('click', () => {
        document.body.removeChild(dialog);
    });
}

function createDialog(content) {
    const dialog = document.createElement('div');
    dialog.classList.add('dialog-box');
    dialog.innerHTML = `<div class="dialog-content">${content}</div>`;
    document.body.appendChild(dialog);
    return dialog;
}

// Feature Handler Functions
function showEmojiPicker() {
    const dialog = createDialog(`
        <div class="emoji-picker">
            <button class="close-btn">X</button>
            <div class="emoji-options">
               <span>😊</span>
               <span>😢</span>
               <span>😃</span>
               <span>😉</span>
               <span>😂</span>
               <span>😍</span>
               <span>😘</span>
               <span>😏</span>
               <span>😒</span>
               <span>😔</span>
               <span>😖</span>
               <span>😡</span>
               <span>😠</span>
               <span>😤</span>
               <span>😱</span>
               <span>😳</span>
            </div>
        </div>
    `);

    dialog.querySelector('.close-btn').addEventListener('click', () => {
        dialog.remove();
    });

    dialog.querySelectorAll('.emoji-options span').forEach(emoji => {
        emoji.addEventListener('click', () => {
            userInput.value += emoji.textContent;
        });
    });
}



function handleVoiceInput() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.start();

    recognition.onresult = (event) => {
        userInput.value = event.results[0][0].transcript;
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
    };
}

function handleFileAttachment() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    fileInput.click();

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log('File selected:', file.name);
            // Handle file upload logic here
        }
    });

    fileInput.remove();
}

