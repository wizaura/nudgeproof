(function () {
    "use strict";

    /*
     * NudgeProof Embed v1
     *
     * Installation:
     *
     * <script
     *     src="https://YOUR_DOMAIN.com/embed/v1.js"
     *     data-site-key="site_xxxxx"
     *     async
     * ></script>
     */

    var SCRIPT_VERSION = "1.0.0";

    var script =
        document.currentScript ||
        document.querySelector(
            'script[data-site-key]'
        );

    if (!script) {
        return;
    }

    var siteKey =
        script.getAttribute("data-site-key");

    if (!siteKey) {
        return;
    }

    /*
     * Prevent the script from being initialized twice.
     */
    if (window.__NUDGEPROOF_LOADED__) {
        return;
    }

    window.__NUDGEPROOF_LOADED__ = true;

    /*
     * The API origin is derived from the script URL.
     *
     * This means the same v1.js can work in:
     *
     * localhost
     * staging
     * production
     */
    var scriptUrl;

    try {
        scriptUrl = new URL(
            script.src,
            window.location.href
        );
    } catch (error) {
        return;
    }

    var API_ORIGIN = scriptUrl.origin;

    var API_URL =
        API_ORIGIN +
        "/api/embed/" +
        encodeURIComponent(siteKey);

    /*
     * ------------------------------------------------------------------------
     * State
     * ------------------------------------------------------------------------
     */

    var state = {
        site: null,
        widgets: [],
        events: [],
        root: null,
        shadow: null,
        activeTimers: [],
        initialized: false
    };

    /*
     * ------------------------------------------------------------------------
     * Utilities
     * ------------------------------------------------------------------------
     */

    function safeNumber(
        value,
        fallback,
        min,
        max
    ) {
        var number = Number(value);

        if (!Number.isFinite(number)) {
            return fallback;
        }

        if (
            typeof min === "number" &&
            number < min
        ) {
            return min;
        }

        if (
            typeof max === "number" &&
            number > max
        ) {
            return max;
        }

        return number;
    }

    function escapeHtml(value) {
        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        var div =
            document.createElement("div");

        div.textContent = String(value);

        return div.innerHTML;
    }

    function escapeAttribute(value) {
        return escapeHtml(value)
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function replacePlaceholder(
        message,
        placeholder,
        value
    ) {
        return String(message || "").replace(
            new RegExp(
                placeholder.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                ),
                "g"
            ),
            value
        );
    }

    function clearTimers() {
        state.activeTimers.forEach(
            function (timer) {
                window.clearTimeout(timer);
            }
        );

        state.activeTimers = [];
    }

    /*
     * ------------------------------------------------------------------------
     * Position
     * ------------------------------------------------------------------------
     */

    function getPositionStyle(
        position
    ) {
        var gap = "20px";

        switch (position) {
            case "bottom-right":
                return (
                    "bottom:" +
                    gap +
                    ";right:" +
                    gap +
                    ";"
                );

            case "top-left":
                return (
                    "top:" +
                    gap +
                    ";left:" +
                    gap +
                    ";"
                );

            case "top-right":
                return (
                    "top:" +
                    gap +
                    ";right:" +
                    gap +
                    ";"
                );

            case "bottom-left":
            default:
                return (
                    "bottom:" +
                    gap +
                    ";left:" +
                    gap +
                    ";"
                );
        }
    }

    /*
     * ------------------------------------------------------------------------
     * Root
     * ------------------------------------------------------------------------
     */

    function createRoot() {
        if (state.root) {
            return;
        }

        var root =
            document.createElement(
                "div"
            );

        root.setAttribute(
            "data-nudgeproof-root",
            "true"
        );

        root.style.position =
            "fixed";

        root.style.left = "0";
        root.style.top = "0";
        root.style.width = "0";
        root.style.height = "0";

        root.style.zIndex =
            "2147483647";

        root.style.pointerEvents =
            "none";

        document.body.appendChild(root);

        state.root = root;

        /*
         * Shadow DOM isolates NudgeProof styles
         * from the customer's website.
         */
        if (root.attachShadow) {
            state.shadow =
                root.attachShadow({
                    mode: "open"
                });
        } else {
            state.shadow = root;
        }

        injectStyles();
    }

    /*
     * ------------------------------------------------------------------------
     * Styles
     * ------------------------------------------------------------------------
     */

    function injectStyles() {
        var style =
            document.createElement(
                "style"
            );

        style.textContent = `
            :host {
                all: initial;
            }

            *,
            *::before,
            *::after {
                box-sizing: border-box;
            }

            .np-container {
                position: fixed;
                width: 0;
                height: 0;
                pointer-events: none;
                z-index: 2147483647;
            }

            .np-container.np-bottom-left {
                left: 0;
                bottom: 0;
            }

            .np-container.np-bottom-right {
                right: 0;
                bottom: 0;
            }

            .np-container.np-top-left {
                left: 0;
                top: 0;
            }

            .np-container.np-top-right {
                right: 0;
                top: 0;
            }

            .np-notification {
                position: fixed;
                width: 340px;
                max-width: calc(100vw - 32px);

                padding: 16px;

                border: 1px solid
                    rgba(0, 0, 0, 0.10);

                border-radius: 14px;

                background: #ffffff;

                color: #111111;

                font-family:
                    -apple-system,
                    BlinkMacSystemFont,
                    "Segoe UI",
                    Roboto,
                    Helvetica,
                    Arial,
                    sans-serif;

                box-shadow:
                    0 12px 40px
                    rgba(0, 0, 0, 0.14);

                pointer-events: auto;

                opacity: 0;

                transform:
                    translateY(12px)
                    scale(0.98);

                transition:
                    opacity 220ms ease,
                    transform 220ms ease;

                line-height: 1.4;

                overflow: hidden;
            }

            .np-notification.np-visible {
                opacity: 1;
                transform:
                    translateY(0)
                    scale(1);
            }

            .np-notification.np-bottom-left {
                left: 20px;
                bottom: 20px;
            }

            .np-notification.np-bottom-right {
                right: 20px;
                bottom: 20px;
            }

            .np-notification.np-top-left {
                left: 20px;
                top: 20px;
            }

            .np-notification.np-top-right {
                right: 20px;
                top: 20px;
            }

            .np-content {
                display: flex;
                gap: 12px;
                align-items: flex-start;
            }

            .np-avatar {
                flex: 0 0 auto;

                width: 42px;
                height: 42px;

                display: flex;
                align-items: center;
                justify-content: center;

                border-radius: 50%;

                background: #f1f1f1;

                color: #555555;

                font-size: 14px;
                font-weight: 600;
            }

            .np-body {
                min-width: 0;
                flex: 1;
            }

            .np-title {
                margin: 0;

                color: #111111;

                font-size: 14px;
                font-weight: 600;

                line-height: 1.35;
            }

            .np-message {
                margin: 4px 0 0;

                color: #555555;

                font-size: 13px;

                line-height: 1.5;
            }

            .np-meta {
                margin-top: 7px;

                color: #888888;

                font-size: 11px;
            }

            .np-live-dot {
                position: relative;

                flex: 0 0 auto;

                width: 42px;
                height: 42px;

                display: flex;
                align-items: center;
                justify-content: center;

                border-radius: 50%;

                background: #f4f4f4;
            }

            .np-live-dot::after {
                content: "";

                width: 11px;
                height: 11px;

                border-radius: 50%;

                background: #22c55e;

                box-shadow:
                    0 0 0 4px
                    rgba(34, 197, 94, 0.12);
            }

            .np-stars {
                display: flex;
                gap: 2px;
                margin-top: 4px;
            }

            .np-star {
                font-size: 13px;
                line-height: 1;
            }

            .np-star-active {
                color: #f59e0b;
            }

            .np-star-inactive {
                color: #d4d4d4;
            }

            .np-reviewer {
                margin: 0;

                color: #111111;

                font-size: 14px;
                font-weight: 600;
            }

            .np-review-text {
                margin: 7px 0 0;

                color: #555555;

                font-size: 13px;

                line-height: 1.5;
            }

            .np-cta {
                display: inline-flex;
                align-items: center;
                justify-content: center;

                margin-top: 12px;

                padding: 8px 12px;

                border: 0;
                border-radius: 8px;

                background: #111111;
                color: #ffffff;

                font-family: inherit;

                font-size: 12px;
                font-weight: 600;

                text-decoration: none;

                cursor: pointer;
            }

            .np-cta:hover {
                opacity: 0.9;
            }

            .np-close {
                position: absolute;

                top: 8px;
                right: 8px;

                width: 24px;
                height: 24px;

                display: flex;
                align-items: center;
                justify-content: center;

                padding: 0;

                border: 0;

                background: transparent;

                color: #888888;

                font-family: inherit;

                font-size: 16px;

                line-height: 1;

                cursor: pointer;

                opacity: 0.7;
            }

            .np-close:hover {
                opacity: 1;
            }

            @media (max-width: 480px) {
                .np-notification {
                    width: auto;
                    left: 16px !important;
                    right: 16px !important;
                    max-width: none;
                }

                .np-notification.np-bottom-left,
                .np-notification.np-bottom-right {
                    bottom: 16px;
                }

                .np-notification.np-top-left,
                .np-notification.np-top-right {
                    top: 16px;
                }
            }
        `;

        state.shadow.appendChild(style);
    }

    /*
     * ------------------------------------------------------------------------
     * Notification HTML
     * ------------------------------------------------------------------------
     */

    function createRecentSales(
        config,
        event
    ) {
        var title =
            config.title ||
            "Recent purchase";

        var message =
            config.message ||
            "{name} purchased {product}";

        var eventData =
            event && event.data
                ? event.data
                : {};

        var name =
            eventData.name ||
            "Someone";

        var product =
            eventData.product ||
            "a product";

        message = replacePlaceholder(
            message,
            "{name}",
            name
        );

        message = replacePlaceholder(
            message,
            "{product}",
            product
        );

        var initial =
            String(name)
                .charAt(0)
                .toUpperCase();

        return `
        <div class="np-content">
            <div class="np-avatar">
                ${escapeHtml(initial)}
            </div>

            <div class="np-body">
                <p class="np-title">
                    ${escapeHtml(title)}
                </p>

                <p class="np-message">
                    ${escapeHtml(message)}
                </p>

                <p class="np-meta">
                    Just now
                </p>
            </div>
        </div>
    `;
    }

    function createLiveVisitors(
        config
    ) {
        var message =
            config.message ||
            "{count} people are viewing this page";

        var minimum =
            safeNumber(
                config.minimum_visitors,
                2,
                1,
                1000000
            );

        /*
         * Temporary demo count.
         *
         * Redis/live visitor data will be
         * connected later.
         */
        var count = Math.max(
            minimum,
            12
        );

        message = replacePlaceholder(
            message,
            "{count}",
            String(count)
        );

        return `
            <div class="np-content">
                <div class="np-live-dot"></div>

                <div class="np-body">
                    <p class="np-message">
                        ${escapeHtml(message)}
                    </p>

                    <p class="np-meta">
                        Live activity
                    </p>
                </div>
            </div>
        `;
    }

    function createReview(
        config
    ) {
        var reviewer =
            config.reviewer ||
            "Sarah";

        var rating =
            safeNumber(
                config.rating,
                5,
                1,
                5
            );

        var text =
            config.text ||
            "Amazing experience. I would definitely recommend this!";

        var initial =
            String(reviewer)
                .charAt(0)
                .toUpperCase();

        var stars = "";

        for (
            var i = 1;
            i <= 5;
            i++
        ) {
            stars +=
                '<span class="np-star ' +
                (i <= rating
                    ? "np-star-active"
                    : "np-star-inactive") +
                '">★</span>';
        }

        return `
            <div class="np-content">
                <div class="np-avatar">
                    ${escapeHtml(initial)}
                </div>

                <div class="np-body">
                    <p class="np-reviewer">
                        ${escapeHtml(reviewer)}
                    </p>

                    <div class="np-stars">
                        ${stars}
                    </div>

                    <p class="np-review-text">
                        ${escapeHtml(text)}
                    </p>
                </div>
            </div>
        `;
    }

    function createAnnouncement(
        config
    ) {
        var title =
            config.title ||
            "Announcement";

        var message =
            config.message ||
            "We have something exciting to share with you.";

        var ctaText =
            config.cta_text || "";

        var ctaUrl =
            config.cta_url || "";

        var cta = "";

        if (
            ctaText &&
            ctaUrl
        ) {
            cta =
                `
                <a
                    class="np-cta"
                    href="${escapeAttribute(
                    ctaUrl
                )}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    ${escapeHtml(ctaText)}
                </a>
                `;
        }

        return `
            <div class="np-body">
                <p class="np-title">
                    ${escapeHtml(title)}
                </p>

                <p class="np-message">
                    ${escapeHtml(message)}
                </p>

                ${cta}
            </div>
        `;
    }

    function createNotificationContent(
        widget,
        event
    ) {
        var config =
            widget.config || {};

        switch (widget.type) {
            case "recent_sales":
                return createRecentSales(
                    config,
                    event
                );

            case "live_visitors":
                return createLiveVisitors(
                    config
                );

            case "review":
                return createReview(
                    config
                );

            case "announcement":
                return createAnnouncement(
                    config
                );

            default:
                return "";
        }
    }

    /*
     * ------------------------------------------------------------------------
     * Render
     * ------------------------------------------------------------------------
     */

    function renderWidget(
        widget
    ) {
        if (
            !state.shadow ||
            !widget
        ) {
            return;
        }

        if (
            !widget.type ||
            !widget.config
        ) {
            return;
        }

        var config =
            widget.config || {};

        var position =
            config.position ||
            "bottom-left";

        var notification =
            document.createElement(
                "div"
            );

        notification.className =
            "np-notification " +
            "np-" +
            position;

        notification.setAttribute(
            "data-widget-id",
            widget.id || ""
        );

        var event = null;

        if (
            widget.type === "recent_sales" &&
            state.events &&
            state.events.length
        ) {
            event = state.events[0];
        }

        notification.innerHTML =
            createNotificationContent(
                widget,
                event
            );

        /*
         * Close button.
         */
        var close =
            document.createElement(
                "button"
            );

        close.type = "button";

        close.className =
            "np-close";

        close.setAttribute(
            "aria-label",
            "Close notification"
        );

        close.textContent = "×";

        close.addEventListener(
            "click",
            function () {
                hideNotification(
                    notification
                );
            }
        );

        notification.appendChild(
            close
        );

        state.shadow.appendChild(
            notification
        );

        var delay =
            safeNumber(
                config.delay,
                3000,
                0,
                60000
            );

        var duration =
            safeNumber(
                config.duration,
                5000,
                1000,
                120000
            );

        /*
         * Show after configured delay.
         */
        var showTimer =
            window.setTimeout(
                function () {
                    showNotification(
                        notification
                    );

                    /*
                     * Automatically hide after
                     * configured duration.
                     */
                    var hideTimer =
                        window.setTimeout(
                            function () {
                                hideNotification(
                                    notification
                                );

                                /*
                                 * Remove from DOM after
                                 * transition completes.
                                 */
                                window.setTimeout(
                                    function () {
                                        if (
                                            notification
                                                .parentNode
                                        ) {
                                            notification.parentNode.removeChild(
                                                notification
                                            );
                                        }
                                    },
                                    250
                                );
                            },
                            duration
                        );

                    state.activeTimers.push(
                        hideTimer
                    );
                },
                delay
            );

        state.activeTimers.push(
            showTimer
        );
    }

    function showNotification(
        element
    ) {
        /*
         * Force layout before adding
         * the visible class so CSS
         * transition works reliably.
         */
        void element.offsetWidth;

        element.classList.add(
            "np-visible"
        );
    }

    function hideNotification(
        element
    ) {
        element.classList.remove(
            "np-visible"
        );
    }

    /*
     * ------------------------------------------------------------------------
     * Widget scheduling
     * ------------------------------------------------------------------------
     */

    function renderWidgets() {
        if (
            !state.widgets ||
            !state.widgets.length
        ) {
            return;
        }

        state.widgets.forEach(
            function (widget) {
                renderWidget(widget);
            }
        );
    }

    /*
     * ------------------------------------------------------------------------
     * API
     * ------------------------------------------------------------------------
     */

    function loadConfiguration() {
        return fetch(
            API_URL,
            {
                method: "GET",
                headers: {
                    Accept:
                        "application/json"
                },
                credentials: "omit",
                cache: "no-store"
            }
        )
            .then(function (response) {
                if (!response.ok) {
                    throw new Error(
                        "NudgeProof API request failed: " +
                        response.status
                    );
                }

                return response.json();
            })
            .then(function (data) {
                if (
                    !data ||
                    !Array.isArray(
                        data.widgets
                    )
                ) {
                    return;
                }

                state.site =
                    data.site || null;

                state.widgets =
                    data.widgets.filter(
                        function (widget) {
                            return (
                                widget &&
                                widget.status ===
                                "active"
                            );
                        }
                    );

                state.events =
                    Array.isArray(data.events)
                        ? data.events
                        : [];
            });
    }

    /*
     * ------------------------------------------------------------------------
     * Initialization
     * ------------------------------------------------------------------------
     */

    function initialize() {
        if (state.initialized) {
            return;
        }

        state.initialized = true;

        /*
         * Wait for the body because the script
         * can be loaded in the <head>.
         */
        if (!document.body) {
            window.setTimeout(
                initialize,
                0
            );

            return;
        }

        createRoot();

        loadConfiguration()
            .then(function () {
                renderWidgets();
            })
            .catch(function (error) {
                /*
                 * NudgeProof must never break
                 * the customer's website.
                 */
                console.warn(
                    "[NudgeProof] Embed failed to load.",
                    error
                );
            });
    }

    /*
     * Start as soon as the DOM is ready.
     */
    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            {
                once: true
            }
        );
    } else {
        initialize();
    }

    /*
     * Expose a tiny public API.
     *
     * This is useful for future integrations
     * and debugging without exposing internals.
     */
    window.NudgeProof = {
        version: SCRIPT_VERSION,

        reload: function () {
            clearTimers();

            if (state.shadow) {
                var notifications =
                    state.shadow.querySelectorAll(
                        ".np-notification"
                    );

                notifications.forEach(
                    function (element) {
                        element.remove();
                    }
                );
            }

            loadConfiguration()
                .then(function () {
                    renderWidgets();
                })
                .catch(function (error) {
                    console.warn(
                        "[NudgeProof] Reload failed.",
                        error
                    );
                });
        }
    };
})();