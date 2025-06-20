/**
 * Loading Partial Component
 * Reusable loading states for all pages
 */

export function createLoadingSpinner(message = 'Loading...') {
  return `
    <div class="loading-container">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p class="loading-message">${message}</p>
      </div>
    </div>
  `;
}

export function createSkeletonCard() {
  return `
    <div class="skeleton-card">
      <div class="skeleton-image"></div>
      <div class="skeleton-content">
        <div class="skeleton-title"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text skeleton-short"></div>
        <div class="skeleton-meta">
          <div class="skeleton-badge"></div>
          <div class="skeleton-badge"></div>
        </div>
      </div>
    </div>
  `;
}

export function createSkeletonGrid(count = 6) {
  return `
    <div class="skeleton-grid">
      ${Array(count)
        .fill(0)
        .map(() => createSkeletonCard())
        .join('')}
    </div>
  `;
}

export function createErrorMessage(
  title = 'Something went wrong',
  message = 'Please try again later.',
  showRetry = true
) {
  return `
    <div class="error-container">
      <div class="error-content">
        <div class="error-icon">⚠️</div>
        <h2 class="error-title">${title}</h2>
        <p class="error-message">${message}</p>
        ${
          showRetry
            ? `
          <button class="btn btn-primary retry-btn" onclick="location.reload()">
            🔄 Try Again
          </button>
        `
            : ''
        }
      </div>
    </div>
  `;
}

export function createEmptyState(title, message, actionText = null, actionHref = null) {
  return `
    <div class="empty-state">
      <div class="empty-content">
        <div class="empty-icon">📭</div>
        <h2 class="empty-title">${title}</h2>
        <p class="empty-message">${message}</p>
        ${
          actionText && actionHref
            ? `
          <a href="${actionHref}" class="btn btn-primary empty-action">
            ${actionText}
          </a>
        `
            : ''
        }
      </div>
    </div>
  `;
}
