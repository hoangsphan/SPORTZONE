(function () {
    function resetShareState(button) {
        const labelElement = button.querySelector('.share-trigger__label');
        const originalLabel = button.dataset.shareOriginalLabel;
        if (labelElement && originalLabel) {
            labelElement.textContent = originalLabel;
        }
        delete button.dataset.shareState;
    }

    function setShareState(button, state, labelText) {
        const labelElement = button.querySelector('.share-trigger__label');
        if (!button.dataset.shareOriginalLabel && labelElement) {
            button.dataset.shareOriginalLabel = labelElement.textContent;
        }

        if (labelElement && labelText) {
            labelElement.textContent = labelText;
        }

        button.dataset.shareState = state;
        const resetDelay = Number.parseInt(button.dataset.shareResetDelay ?? '2200', 10);
        window.setTimeout(() => resetShareState(button), Number.isFinite(resetDelay) ? resetDelay : 2200);
    }

    async function copyToClipboard(text) {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return;
        }

        const input = document.createElement('textarea');
        input.value = text;
        input.setAttribute('readonly', '');
        input.style.position = 'absolute';
        input.style.left = '-9999px';
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
    }

    async function shareLink(button) {
        const url = button.dataset.shareUrl;
        if (!url) {
            return;
        }

        const title = button.dataset.shareTitle || document.title;
        const text = button.dataset.shareText || '';
        const successLabel = button.dataset.shareSuccessLabel || 'Đã sao chép!';
        const sharedLabel = button.dataset.shareSharedLabel || successLabel;
        const resetLabel = button.dataset.shareResetLabel || button.dataset.shareOriginalLabel;

        if (navigator.share) {
            try {
                await navigator.share({ url, title, text });
                setShareState(button, 'shared', sharedLabel);
                return;
            }
            catch (error) {
                if (error?.name === 'AbortError') {
                    return;
                }
                // Fallback to clipboard copy if share is not available or fails.
            }
        }

        try {
            await copyToClipboard(url);
            setShareState(button, 'copied', successLabel);
        }
        catch (copyError) {
            console.error('Không thể sao chép liên kết:', copyError);
            setShareState(button, 'copied', resetLabel || successLabel);
        }
    }

    function initShareButtons() {
        const shareButtons = document.querySelectorAll('[data-share-url].share-trigger');
        shareButtons.forEach((button) => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                shareLink(button);
            });
        });
    }

    function initRoleSections() {
        const roleSelect = document.querySelector('[data-role-toggle]');
        if (!roleSelect) {
            return;
        }

        const sections = document.querySelectorAll('[data-role-section]');

        const getTargetRoles = (element) => {
            const value = element.dataset.roleSection || '';
            return value
                .split(',')
                .map((item) => item.trim().toLowerCase())
                .filter(Boolean);
        };

        const updateVisibility = () => {
            const selectedRole = (roleSelect.value || '').trim().toLowerCase();
            sections.forEach((section) => {
                const roles = getTargetRoles(section);
                const shouldShow = roles.length === 0 || roles.includes(selectedRole);
                section.classList.toggle('is-visible', shouldShow);
            });
        };

        roleSelect.addEventListener('change', updateVisibility);
        updateVisibility();
    }

    document.addEventListener('DOMContentLoaded', () => {
        initShareButtons();
        initRoleSections();
    });
})();
