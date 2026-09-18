(function () {
    "use strict";

    var SCRIPT_VERSION = "2.2.0";

    var script =
        document.currentScript ||
        document.querySelector(
            'script[data-site], script[data-site-key]'
        );

    if (!script) return;

    var siteKey =
        script.getAttribute("data-site") ||
        script.getAttribute("data-site-key");

    if (!siteKey || window.__NUDGEPROOF_LOADED__) return;

    window.__NUDGEPROOF_LOADED__ = true;

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

    var VISITORS_API_URL =
        API_URL +
        "/visitors";

    var QUEUE_POSITIONS = [
        "top",
        "bottom"
    ];

    var VISUAL_POSITIONS = [
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right"
    ];

    var MAX_QUEUE_SIZE = 5;
    var POLL_INTERVAL = 15000;
    var VISITOR_HEARTBEAT_INTERVAL = 30000;

    /*
     * Live Visitors:
     *
     * The popup is displayed only for its configured
     * duration. After it has been displayed, the same
     * live visitor widget cannot display again for 60s.
     */
    var LIVE_VISITOR_COOLDOWN = 60000;

    var state = {
        site: null,
        widgets: [],
        events: [],
        liveVisitors: null,

        root: null,
        shadow: null,

        initialized: false,

        activeTimers: [],

        pollTimer: null,
        visitorPollTimer: null,
        visitorHeartbeatTimer: null,

        shownEventIds: {},
        shownAnnouncementIds: {},
        shownFallbackReviewIds: {},

        lastLiveShown: {},
        liveCooldownTimers: {},

        positionQueues: {
            top: [],
            bottom: []
        },

        activePositions: {
            top: null,
            bottom: null
        },

        queueWaiting: {
            top: false,
            bottom: false
        },

        queueTimers: {
            top: null,
            bottom: null
        }
    };

    function getPosition(position) {
        if (
            VISUAL_POSITIONS.indexOf(position) !== -1
        ) {
            return position;
        }

        return "bottom-left";
    }

    function getQueuePosition(position) {
        var visualPosition =
            getPosition(position);

        if (
            visualPosition === "top-left" ||
            visualPosition === "top-right"
        ) {
            return "top";
        }

        return "bottom";
    }

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
            String(value)
        );
    }

    function getInitial(value) {
        var text =
            String(value || "").trim();

        if (!text) {
            return "•";
        }

        return text
            .charAt(0)
            .toUpperCase();
    }

    function formatRelativeTime(
        dateValue
    ) {
        if (!dateValue) {
            return "Just now";
        }

        var timestamp =
            new Date(dateValue).getTime();

        if (!Number.isFinite(timestamp)) {
            return "Just now";
        }

        var seconds = Math.max(
            0,
            Math.floor(
                (Date.now() - timestamp) /
                    1000
            )
        );

        if (seconds < 60) {
            return "Just now";
        }

        var minutes =
            Math.floor(seconds / 60);

        if (minutes < 60) {
            return (
                minutes +
                (
                    minutes === 1
                        ? " minute ago"
                        : " minutes ago"
                )
            );
        }

        var hours =
            Math.floor(minutes / 60);

        if (hours < 24) {
            return (
                hours +
                (
                    hours === 1
                        ? " hour ago"
                        : " hours ago"
                )
            );
        }

        var days =
            Math.floor(hours / 24);

        return (
            days +
            (
                days === 1
                    ? " day ago"
                    : " days ago"
            )
        );
    }

    function addTimer(
        callback,
        delay
    ) {
        var timer =
            window.setTimeout(
                function () {
                    var index =
                        state.activeTimers.indexOf(
                            timer
                        );

                    if (index !== -1) {
                        state.activeTimers.splice(
                            index,
                            1
                        );
                    }

                    callback();
                },
                delay
            );

        state.activeTimers.push(timer);

        return timer;
    }

    function clearTimers() {
        state.activeTimers.forEach(
            function (timer) {
                window.clearTimeout(timer);
            }
        );

        state.activeTimers = [];

        QUEUE_POSITIONS.forEach(
            function (position) {
                if (
                    state.queueTimers[position]
                ) {
                    window.clearTimeout(
                        state.queueTimers[position]
                    );

                    state.queueTimers[position] =
                        null;
                }

                state.queueWaiting[position] =
                    false;
            }
        );

        Object.keys(
            state.liveCooldownTimers
        ).forEach(
            function (widgetId) {
                window.clearTimeout(
                    state.liveCooldownTimers[
                        widgetId
                    ]
                );
            }
        );

        state.liveCooldownTimers = {};
    }

    function clearPollTimer() {
        if (state.pollTimer) {
            window.clearTimeout(
                state.pollTimer
            );

            state.pollTimer = null;
        }
    }

    function clearVisitorPolling() {
        if (state.visitorPollTimer) {
            window.clearTimeout(
                state.visitorPollTimer
            );

            state.visitorPollTimer = null;
        }
    }

    function clearVisitorHeartbeat() {
        if (
            state.visitorHeartbeatTimer
        ) {
            window.clearInterval(
                state.visitorHeartbeatTimer
            );

            state.visitorHeartbeatTimer =
                null;
        }
    }

    function createRoot() {
        if (state.root) {
            return;
        }

        var root =
            document.createElement("div");

        root.setAttribute(
            "data-nudgeproof-root",
            "true"
        );

        root.style.position = "fixed";
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

    function injectStyles() {
        var style =
            document.createElement("style");

        style.textContent = `
            :host {
                all: initial;
            }

            *,
            *::before,
            *::after {
                box-sizing: border-box;
            }

            .np-notification {
                position: fixed;
                width: 350px;
                max-width: calc(100vw - 32px);
                padding: 15px 16px;
                border: 1px solid rgba(20, 20, 20, 0.09);
                border-radius: 16px;
                background: #ffffff;
                color: #141414;
                font-family:
                    -apple-system,
                    BlinkMacSystemFont,
                    "Segoe UI",
                    Roboto,
                    Helvetica,
                    Arial,
                    sans-serif;
                box-shadow:
                    0 18px 55px rgba(20, 20, 20, 0.16),
                    0 2px 8px rgba(20, 20, 20, 0.06);
                pointer-events: auto;
                opacity: 0;
                transform:
                    translateY(12px)
                    scale(0.985);
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
                align-items: flex-start;
                gap: 12px;
            }

            .np-avatar {
                width: 42px;
                height: 42px;
                flex: 0 0 42px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background: #007fff;
                color: #ffffff;
                font-size: 14px;
                font-weight: 700;
                line-height: 1;
            }

            .np-body {
                min-width: 0;
                flex: 1;
            }

            .np-title {
                margin: 0;
                color: #141414;
                font-size: 14px;
                font-weight: 650;
                line-height: 1.35;
            }

            .np-message {
                margin: 4px 0 0;
                color: #555555;
                font-size: 13px;
                line-height: 1.5;
            }

            .np-meta {
                display: flex;
                align-items: center;
                gap: 6px;
                margin-top: 7px;
                color: #8a8a8a;
                font-size: 11px;
                line-height: 1.3;
            }

            .np-dot {
                width: 6px;
                height: 6px;
                flex: 0 0 6px;
                border-radius: 50%;
                background: #007fff;
                box-shadow:
                    0 0 0 4px
                    rgba(0, 127, 255, 0.10);
            }

            .np-live-icon {
                width: 42px;
                height: 42px;
                flex: 0 0 42px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background:
                    rgba(0, 127, 255, 0.08);
                color: #007fff;
            }

            .np-live-icon::after {
                content: "";
                width: 11px;
                height: 11px;
                border-radius: 50%;
                background: #007fff;
                box-shadow:
                    0 0 0 4px
                    rgba(0, 127, 255, 0.12);
            }

            .np-stars {
                display: flex;
                gap: 2px;
                margin-top: 5px;
            }

            .np-star {
                font-size: 14px;
                line-height: 1;
            }

            .np-star-active {
                color: #f59e0b;
            }

            .np-star-inactive {
                color: #d6d6d6;
            }

            .np-reviewer {
                margin: 0;
                color: #141414;
                font-size: 14px;
                font-weight: 650;
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
                border-radius: 9px;
                background: #141414;
                color: #ffffff;
                font-family: inherit;
                font-size: 12px;
                font-weight: 600;
                text-decoration: none;
                cursor: pointer;
                transition:
                    opacity 150ms ease,
                    transform 150ms ease;
            }

            .np-cta:hover {
                opacity: 0.88;
                transform: translateY(-1px);
            }

            .np-close {
                position: absolute;
                top: 7px;
                right: 7px;
                width: 25px;
                height: 25px;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0;
                border: 0;
                background: transparent;
                color: #999999;
                font-family: inherit;
                font-size: 17px;
                line-height: 1;
                cursor: pointer;
                opacity: 0.65;
                transition:
                    opacity 150ms ease;
            }

            .np-close:hover {
                opacity: 1;
            }

            @media (max-width: 480px) {
                .np-notification {
                    left: 16px !important;
                    right: 16px !important;
                    width: auto;
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

            @media (prefers-reduced-motion: reduce) {
                .np-notification {
                    transition:
                        opacity 150ms ease;
                    transform: none;
                }

                .np-notification.np-visible {
                    transform: none;
                }

                .np-cta {
                    transition: none;
                }
            }
        `;

        state.shadow.appendChild(style);
    }

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

        var data =
            event &&
            event.data &&
            typeof event.data === "object"
                ? event.data
                : {};

        var name =
            typeof data.name === "string" &&
            data.name.trim()
                ? data.name.trim()
                : "Someone";

        var product =
            typeof data.product === "string" &&
            data.product.trim()
                ? data.product.trim()
                : "a product";

        message =
            replacePlaceholder(
                message,
                "{name}",
                escapeHtml(name)
            );

        message =
            replacePlaceholder(
                message,
                "{product}",
                escapeHtml(product)
            );

        var relativeTime =
            event &&
            event.created_at
                ? formatRelativeTime(
                      event.created_at
                  )
                : "Just now";

        return (
            '<div class="np-content">' +
                '<div class="np-avatar">' +
                    escapeHtml(
                        getInitial(name)
                    ) +
                "</div>" +

                '<div class="np-body">' +
                    '<p class="np-title">' +
                        escapeHtml(title) +
                    "</p>" +

                    '<p class="np-message">' +
                        message +
                    "</p>" +

                    '<div class="np-meta">' +
                        '<span class="np-dot"></span>' +
                        escapeHtml(relativeTime) +
                    "</div>" +
                "</div>" +
            "</div>"
        );
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
                1,
                1,
                1000000
            );

        var count =
            safeNumber(
                state.liveVisitors,
                0,
                0,
                1000000
            );

        if (count < minimum) {
            return "";
        }

        message =
            replacePlaceholder(
                message,
                "{count}",
                String(count)
            );

        return (
            '<div class="np-content">' +
                '<div class="np-live-icon"></div>' +

                '<div class="np-body">' +
                    '<p class="np-message">' +
                        escapeHtml(message) +
                    "</p>" +

                    '<div class="np-meta">' +
                        '<span class="np-dot"></span>' +
                        "Live activity" +
                    "</div>" +
                "</div>" +
            "</div>"
        );
    }

    function createReview(
        config,
        event
    ) {
        var data =
            event &&
            event.data &&
            typeof event.data === "object"
                ? event.data
                : {};

        var reviewer =
            typeof data.name === "string" &&
            data.name.trim()
                ? data.name.trim()
                : config.reviewer ||
                  "Customer";

        var configuredRating =
            safeNumber(
                config.rating,
                5,
                1,
                5
            );

        var rating =
            data.rating !== undefined
                ? safeNumber(
                      data.rating,
                      configuredRating,
                      1,
                      5
                  )
                : configuredRating;

        var text =
            typeof data.text === "string" &&
            data.text.trim()
                ? data.text.trim()
                : config.text ||
                  "Amazing experience. I would definitely recommend this!";

        var stars = "";

        for (
            var i = 1;
            i <= 5;
            i++
        ) {
            stars +=
                '<span class="np-star ' +
                (
                    i <= rating
                        ? "np-star-active"
                        : "np-star-inactive"
                ) +
                '">★</span>';
        }

        return (
            '<div class="np-content">' +
                '<div class="np-avatar">' +
                    escapeHtml(
                        getInitial(reviewer)
                    ) +
                "</div>" +

                '<div class="np-body">' +
                    '<p class="np-reviewer">' +
                        escapeHtml(reviewer) +
                    "</p>" +

                    '<div class="np-stars">' +
                        stars +
                    "</div>" +

                    '<p class="np-review-text">' +
                        escapeHtml(text) +
                    "</p>" +
                "</div>" +
            "</div>"
        );
    }

    function createAnnouncement(
        config
    ) {
        var title =
            config.title ||
            "Announcement";

        var message =
            config.message || "";

        var buttonText =
            typeof config.cta_text === "string"
                ? config.cta_text.trim()
                : "";

        var buttonUrl =
            typeof config.cta_url === "string"
                ? config.cta_url.trim()
                : "";

        var cta = "";

        if (
            buttonText &&
            buttonUrl
        ) {
            cta =
                '<a class="np-cta" href="' +
                escapeAttribute(buttonUrl) +
                '" target="_blank" rel="noopener noreferrer">' +
                escapeHtml(buttonText) +
                "</a>";
        }

        return (
            '<div class="np-content">' +
                '<div class="np-avatar">i</div>' +

                '<div class="np-body">' +
                    '<p class="np-title">' +
                        escapeHtml(title) +
                    "</p>" +

                    '<p class="np-message">' +
                        escapeHtml(message) +
                    "</p>" +

                    cta +
                "</div>" +
            "</div>"
        );
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
                    config,
                    event
                );

            case "announcement":
                return createAnnouncement(
                    config
                );

            default:
                return "";
        }
    }

    function createNotification(
        widget,
        event,
        visualPosition
    ) {
        var position =
            getPosition(visualPosition);

        var element =
            document.createElement("div");

        element.className =
            "np-notification np-" +
            position;

        element.setAttribute(
            "data-widget-id",
            widget.id
        );

        element.setAttribute(
            "data-widget-type",
            widget.type
        );

        element.innerHTML =
            '<div class="np-notification-content">' +
                createNotificationContent(
                    widget,
                    event
                ) +
            "</div>" +

            '<button class="np-close" type="button" aria-label="Close">' +
                "×" +
            "</button>";

        var closeButton =
            element.querySelector(
                ".np-close"
            );

        if (closeButton) {
            closeButton.addEventListener(
                "click",
                function () {
                    finishNotification(
                        getQueuePosition(
                            position
                        ),
                        element,
                        true
                    );
                }
            );
        }

        return element;
    }

    function getDuration(
        widget
    ) {
        return safeNumber(
            widget &&
            widget.config &&
            widget.config.duration,
            5000,
            1000,
            60000
        );
    }

    function getDelay(
        widget
    ) {
        return safeNumber(
            widget &&
            widget.config &&
            widget.config.delay,
            3000,
            0,
            60000
        );
    }

    function isSameQueueItem(
        item,
        widget,
        event
    ) {
        if (
            !item ||
            !item.widget ||
            item.widget.id !== widget.id
        ) {
            return false;
        }

        if (
            event &&
            event.id
        ) {
            return (
                item.eventId ===
                event.id
            );
        }

        return true;
    }

    function enqueueNotification(
        widget,
        event,
        options
    ) {
        if (
            !widget ||
            widget.status !== "active" ||
            !state.initialized
        ) {
            return;
        }

        options =
            options || {};

        var visualPosition =
            getPosition(
                widget.config &&
                widget.config.position
            );

        var queuePosition =
            getQueuePosition(
                visualPosition
            );

        var queue =
            state.positionQueues[
                queuePosition
            ];

        if (!queue) {
            return;
        }

        var duplicateInQueue =
            queue.some(
                function (item) {
                    return isSameQueueItem(
                        item,
                        widget,
                        event
                    );
                }
            );

        if (duplicateInQueue) {
            return;
        }

        var active =
            state.activePositions[
                queuePosition
            ];

        if (
            active &&
            active.widget &&
            active.widget.id ===
                widget.id &&
            (
                !event ||
                active.eventId ===
                    event.id
            )
        ) {
            return;
        }

        if (
            queue.length >=
            MAX_QUEUE_SIZE
        ) {
            queue.shift();
        }

        queue.push({
            widget: widget,
            event:
                event || null,

            eventId:
                event &&
                event.id
                    ? event.id
                    : null,

            visualPosition:
                visualPosition,

            queuePosition:
                queuePosition,

            delay:
                options.skipDelay
                    ? 0
                    : getDelay(widget),

            isLive:
                options.isLive === true
        });

        showNextNotification(
            queuePosition
        );
    }

    function showNextNotification(
        queuePosition
    ) {
        if (
            state.activePositions[
                queuePosition
            ]
        ) {
            return;
        }

        if (
            state.queueWaiting[
                queuePosition
            ]
        ) {
            return;
        }

        var queue =
            state.positionQueues[
                queuePosition
            ];

        if (
            !queue ||
            !queue.length
        ) {
            return;
        }

        var item =
            queue.shift();

        var delay =
            safeNumber(
                item.delay,
                0,
                0,
                60000
            );

        if (delay > 0) {
            state.queueWaiting[
                queuePosition
            ] = true;

            state.queueTimers[
                queuePosition
            ] =
                window.setTimeout(
                    function () {
                        state.queueTimers[
                            queuePosition
                        ] = null;

                        state.queueWaiting[
                            queuePosition
                        ] = false;

                        if (
                            state.activePositions[
                                queuePosition
                            ]
                        ) {
                            state.positionQueues[
                                queuePosition
                            ].unshift(item);

                            return;
                        }

                        showQueuedNotification(
                            queuePosition,
                            item
                        );
                    },
                    delay
                );

            return;
        }

        showQueuedNotification(
            queuePosition,
            item
        );
    }

    function showQueuedNotification(
        queuePosition,
        item
    ) {
        if (
            state.activePositions[
                queuePosition
            ]
        ) {
            state.positionQueues[
                queuePosition
            ].unshift(item);

            return;
        }

        var element =
            createNotification(
                item.widget,
                item.event,
                item.visualPosition
            );

        if (!element) {
            showNextNotification(
                queuePosition
            );

            return;
        }

        state.shadow.appendChild(
            element
        );

        var active = {
            widget:
                item.widget,

            event:
                item.event,

            eventId:
                item.eventId,

            element:
                element,

            isLive:
                item.isLive === true,

            visualPosition:
                item.visualPosition,

            queuePosition:
                queuePosition,

            durationTimer:
                null,

            finishing:
                false
        };

        state.activePositions[
            queuePosition
        ] = active;

        /*
         * IMPORTANT:
         *
         * The 60 second Live Visitors cooldown
         * starts when the notification ACTUALLY
         * appears, not when it gets queued.
         */
        if (active.isLive) {
            var liveWidgetId =
                item.widget.id;

            state.lastLiveShown[
                liveWidgetId
            ] = Date.now();

            if (
                state.liveCooldownTimers[
                    liveWidgetId
                ]
            ) {
                window.clearTimeout(
                    state.liveCooldownTimers[
                        liveWidgetId
                    ]
                );
            }

            state.liveCooldownTimers[
                liveWidgetId
            ] =
                window.setTimeout(
                    function () {
                        delete state.liveCooldownTimers[
                            liveWidgetId
                        ];

                        if (
                            !state.initialized
                        ) {
                            return;
                        }

                        var currentWidget =
                            state.widgets.find(
                                function (
                                    widget
                                ) {
                                    return (
                                        widget &&
                                        widget.id ===
                                            liveWidgetId
                                    );
                                }
                            );

                        if (
                            currentWidget &&
                            currentWidget.status ===
                                "active" &&
                            currentWidget.type ===
                                "live_visitors"
                        ) {
                            updateLiveNotification(
                                currentWidget
                            );
                        }
                    },
                    LIVE_VISITOR_COOLDOWN
                );
        }

        requestAnimationFrame(
            function () {
                requestAnimationFrame(
                    function () {
                        if (
                            element.parentNode
                        ) {
                            element.classList.add(
                                "np-visible"
                            );
                        }
                    }
                );
            }
        );

        /*
         * Every notification, including Live Visitors,
         * always gets a duration timer.
         */
        active.durationTimer =
            window.setTimeout(
                function () {
                    finishNotification(
                        queuePosition,
                        element,
                        false
                    );
                },
                getDuration(
                    item.widget
                )
            );
    }

    function finishNotification(
        queuePosition,
        element,
        immediate
    ) {
        var active =
            state.activePositions[
                queuePosition
            ];

        if (
            !active ||
            active.element !== element ||
            active.finishing
        ) {
            return;
        }

        active.finishing = true;

        if (
            active.durationTimer
        ) {
            window.clearTimeout(
                active.durationTimer
            );

            active.durationTimer = null;
        }

        element.classList.remove(
            "np-visible"
        );

        var removeDelay =
            immediate ? 0 : 240;

        window.setTimeout(
            function () {
                if (
                    element.parentNode
                ) {
                    element.parentNode.removeChild(
                        element
                    );
                }

                if (
                    state.activePositions[
                        queuePosition
                    ] === active
                ) {
                    state.activePositions[
                        queuePosition
                    ] = null;
                }

                showNextNotification(
                    queuePosition
                );
            },
            removeDelay
        );
    }

    /*
     * LIVE VISITORS
     *
     * This is intentionally different from normal
     * event widgets.
     *
     * It does NOT create a permanent notification.
     * It simply schedules a normal notification.
     *
     * Once shown:
     *   - duration controls how long it remains visible
     *   - 60 second cooldown prevents another display
     *   - visitor tracking continues independently
     */
    function updateLiveNotification(
        widget
    ) {
        if (
            !widget ||
            widget.status !== "active" ||
            widget.type !== "live_visitors"
        ) {
            return;
        }

        var visualPosition =
            getPosition(
                widget.config &&
                widget.config.position
            );

        var queuePosition =
            getQueuePosition(
                visualPosition
            );

        var minimum =
            safeNumber(
                widget.config &&
                widget.config.minimum_visitors,
                1,
                1,
                1000000
            );

        var count =
            safeNumber(
                state.liveVisitors,
                0,
                0,
                1000000
            );

        /*
         * Do not queue a Live Visitors popup
         * if the visitor count is below the
         * configured minimum.
         */
        if (count < minimum) {
            state.positionQueues[
                queuePosition
            ] =
                state.positionQueues[
                    queuePosition
                ].filter(
                    function (item) {
                        return !(
                            item &&
                            item.isLive === true &&
                            item.widget &&
                            item.widget.id ===
                                widget.id
                        );
                    }
                );

            return;
        }

        /*
         * If this same Live Visitors widget
         * is currently visible, do nothing.
         *
         * Its duration timer controls when it
         * disappears.
         */
        var active =
            state.activePositions[
                queuePosition
            ];

        if (
            active &&
            active.widget &&
            active.widget.id ===
                widget.id &&
            active.isLive
        ) {
            return;
        }

        /*
         * Don't put another copy of the same
         * Live Visitors widget into the queue.
         */
        var queue =
            state.positionQueues[
                queuePosition
            ];

        var alreadyQueued =
            queue.some(
                function (item) {
                    return (
                        item &&
                        item.isLive === true &&
                        item.widget &&
                        item.widget.id ===
                            widget.id
                    );
                }
            );

        if (alreadyQueued) {
            return;
        }

        /*
         * 60-second cooldown.
         */
        var now = Date.now();

        var lastShown =
            state.lastLiveShown[
                widget.id
            ] || 0;

        if (
            now - lastShown <
            LIVE_VISITOR_COOLDOWN
        ) {
            return;
        }

        /*
         * Queue as a NORMAL timed notification.
         *
         * There is deliberately no special
         * "persistent live notification" path.
         */
        enqueueNotification(
            widget,
            null,
            {
                skipDelay: false,
                isLive: true
            }
        );
    }

    function getLatestUnseenEvent(
        type
    ) {
        for (
            var i = 0;
            i < state.events.length;
            i++
        ) {
            var event =
                state.events[i];

            if (
                !event ||
                event.type !== type ||
                !event.id ||
                state.shownEventIds[
                    event.id
                ]
            ) {
                continue;
            }

            return event;
        }

        return null;
    }

    function markEventShown(
        event
    ) {
        if (
            event &&
            event.id
        ) {
            state.shownEventIds[
                event.id
            ] = true;
        }
    }

    function processPurchaseWidgets() {
        var purchase =
            getLatestUnseenEvent(
                "purchase"
            );

        if (!purchase) {
            return;
        }

        var widgets =
            state.widgets.filter(
                function (widget) {
                    return (
                        widget &&
                        widget.status ===
                            "active" &&
                        widget.type ===
                            "recent_sales"
                    );
                }
            );

        if (!widgets.length) {
            return;
        }

        widgets.forEach(
            function (widget) {
                enqueueNotification(
                    widget,
                    purchase
                );
            }
        );

        markEventShown(
            purchase
        );
    }

    function processReviewWidgets() {
        var widgets =
            state.widgets.filter(
                function (widget) {
                    return (
                        widget &&
                        widget.status ===
                            "active" &&
                        widget.type ===
                            "review"
                    );
                }
            );

        if (!widgets.length) {
            return;
        }

        var review =
            getLatestUnseenEvent(
                "review"
            );

        if (review) {
            widgets.forEach(
                function (widget) {
                    enqueueNotification(
                        widget,
                        review
                    );
                }
            );

            markEventShown(
                review
            );

            return;
        }

        var hasReviewEvent =
            state.events.some(
                function (event) {
                    return (
                        event &&
                        event.type ===
                            "review"
                    );
                }
            );

        if (hasReviewEvent) {
            return;
        }

        widgets.forEach(
            function (widget) {
                if (
                    state
                        .shownFallbackReviewIds[
                        widget.id
                    ]
                ) {
                    return;
                }

                state.shownFallbackReviewIds[
                    widget.id
                ] = true;

                enqueueNotification(
                    widget,
                    null
                );
            }
        );
    }

    function processAnnouncementWidgets() {
        state.widgets.forEach(
            function (widget) {
                if (
                    !widget ||
                    widget.status !==
                        "active" ||
                    widget.type !==
                        "announcement"
                ) {
                    return;
                }

                if (
                    state
                        .shownAnnouncementIds[
                        widget.id
                    ]
                ) {
                    return;
                }

                state.shownAnnouncementIds[
                    widget.id
                ] = true;

                enqueueNotification(
                    widget,
                    null
                );
            }
        );
    }

    function processLiveWidgets() {
        state.widgets.forEach(
            function (widget) {
                if (
                    widget &&
                    widget.status ===
                        "active" &&
                    widget.type ===
                        "live_visitors"
                ) {
                    updateLiveNotification(
                        widget
                    );
                }
            }
        );
    }

    function processWidgets() {
        if (!state.initialized) {
            return;
        }

        processPurchaseWidgets();
        processReviewWidgets();
        processAnnouncementWidgets();
        processLiveWidgets();
    }

    function normalizeConfig(
        widget
    ) {
        if (
            !widget.config ||
            typeof widget.config !==
                "object"
        ) {
            widget.config = {};
        }

        widget.config.position =
            getPosition(
                widget.config.position
            );

        if (
            widget.config.duration ===
            undefined
        ) {
            widget.config.duration =
                5000;
        }

        if (
            widget.config.delay ===
            undefined
        ) {
            widget.config.delay =
                3000;
        }

        return widget;
    }

    function normalizeWidgets(
        widgets
    ) {
        return (
            Array.isArray(widgets)
                ? widgets
                : []
        ).map(
            function (widget) {
                return normalizeConfig(
                    widget
                );
            }
        );
    }

    function loadConfiguration() {
        return fetch(
            API_URL,
            {
                method: "GET",
                mode: "cors",
                credentials: "omit",
                cache: "no-store",
                headers: {
                    Accept:
                        "application/json"
                }
            }
        )
            .then(
                function (response) {
                    if (!response.ok) {
                        throw new Error(
                            "Failed to load NudgeProof configuration"
                        );
                    }

                    return response.json();
                }
            )
            .then(
                function (data) {
                    if (
                        !data ||
                        !data.site
                    ) {
                        throw new Error(
                            "Invalid NudgeProof configuration"
                        );
                    }

                    state.site =
                        data.site;

                    state.widgets =
                        normalizeWidgets(
                            data.widgets
                        );

                    state.events =
                        Array.isArray(
                            data.events
                        )
                            ? data.events
                            : [];

                    state.initialized =
                        true;

                    createRoot();

                    processWidgets();

                    scheduleEventPolling();
                    scheduleVisitorPolling();
                    startVisitorHeartbeat();
                }
            )
            .catch(
                function () {
                    state.initialized =
                        false;

                    scheduleRetry();
                }
            );
    }

    function pollEvents() {
        if (
            !state.initialized
        ) {
            return;
        }

        fetch(
            API_URL,
            {
                method: "GET",
                mode: "cors",
                credentials: "omit",
                cache: "no-store",
                headers: {
                    Accept:
                        "application/json"
                }
            }
        )
            .then(
                function (response) {
                    if (!response.ok) {
                        throw new Error(
                            "Event polling failed"
                        );
                    }

                    return response.json();
                }
            )
            .then(
                function (data) {
                    if (!data) {
                        return;
                    }

                    if (
                        Array.isArray(
                            data.events
                        )
                    ) {
                        state.events =
                            data.events;
                    }

                    if (
                        Array.isArray(
                            data.widgets
                        )
                    ) {
                        state.widgets =
                            normalizeWidgets(
                                data.widgets
                            );
                    }

                    processWidgets();
                }
            )
            .catch(
                function () {}
            )
            .finally(
                function () {
                    scheduleEventPolling();
                }
            );
    }

    function scheduleEventPolling() {
        clearPollTimer();

        state.pollTimer =
            window.setTimeout(
                function () {
                    state.pollTimer =
                        null;

                    pollEvents();
                },
                POLL_INTERVAL
            );
    }

    function scheduleRetry() {
        clearPollTimer();

        state.pollTimer =
            window.setTimeout(
                function () {
                    state.pollTimer =
                        null;

                    loadConfiguration();
                },
                10000
            );
    }

        function getVisitorId() {
        var storageKey =
            "nudgeproof_visitor_id";

        try {
            var existing =
                window.localStorage.getItem(
                    storageKey
                );

            if (existing) {
                return existing;
            }

            var generated =
                "v_" +
                Date.now() +
                "_" +
                Math.random()
                    .toString(36)
                    .slice(2, 12);

            window.localStorage.setItem(
                storageKey,
                generated
            );

            return generated;
        } catch (error) {
            return (
                "v_" +
                Date.now() +
                "_" +
                Math.random()
                    .toString(36)
                    .slice(2, 12)
            );
        }
    }

    var visitorId =
        getVisitorId();

    function sendHeartbeat() {
        if (
            !state.initialized
        ) {
            return;
        }

        fetch(
            VISITORS_API_URL +
                "/heartbeat",
            {
                method: "POST",
                mode: "cors",
                credentials: "omit",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    visitor_id:
                        visitorId,

                    page:
                        window.location.href
                }),
                keepalive: true
            }
        )
            .then(
                function (response) {
                    if (!response.ok) {
                        throw new Error(
                            "Heartbeat failed"
                        );
                    }

                    return response.json();
                }
            )
            .then(
                function (data) {
                    if (
                        data &&
                        typeof data.count ===
                            "number"
                    ) {
                        state.liveVisitors =
                            data.count;

                        updateLiveWidgets();
                    }
                }
            )
            .catch(
                function () {}
            );
    }

    function startVisitorHeartbeat() {
        clearVisitorHeartbeat();

        /*
         * Initial heartbeat immediately.
         */
        sendHeartbeat();

        /*
         * Continue tracking visitors in the
         * background regardless of whether the
         * Live Visitors popup is currently visible.
         */
        state.visitorHeartbeatTimer =
            window.setInterval(
                sendHeartbeat,
                VISITOR_HEARTBEAT_INTERVAL
            );
    }

    function pollVisitors() {
        if (
            !state.initialized
        ) {
            return;
        }

        fetch(
            VISITORS_API_URL,
            {
                method: "GET",
                mode: "cors",
                credentials: "omit",
                cache: "no-store",
                headers: {
                    Accept:
                        "application/json"
                }
            }
        )
            .then(
                function (response) {
                    if (!response.ok) {
                        throw new Error(
                            "Visitor polling failed"
                        );
                    }

                    return response.json();
                }
            )
            .then(
                function (data) {
                    if (
                        data &&
                        typeof data.count ===
                            "number"
                    ) {
                        state.liveVisitors =
                            data.count;

                        updateLiveWidgets();
                    }
                }
            )
            .catch(
                function () {}
            )
            .finally(
                function () {
                    scheduleVisitorPolling();
                }
            );
    }

    function scheduleVisitorPolling() {
        clearVisitorPolling();

        state.visitorPollTimer =
            window.setTimeout(
                function () {
                    state.visitorPollTimer =
                        null;

                    pollVisitors();
                },
                POLL_INTERVAL
            );
    }

    function updateLiveWidgets() {
        state.widgets.forEach(
            function (widget) {
                if (
                    widget &&
                    widget.type ===
                        "live_visitors" &&
                    widget.status ===
                        "active"
                ) {
                    updateLiveNotification(
                        widget
                    );
                }
            }
        );
    }

    function removeElement(
        element
    ) {
        if (
            element &&
            element.parentNode
        ) {
            element.parentNode.removeChild(
                element
            );
        }
    }

    function resetQueues() {
        QUEUE_POSITIONS.forEach(
            function (queuePosition) {
                state.positionQueues[
                    queuePosition
                ] = [];

                if (
                    state.queueTimers[
                        queuePosition
                    ]
                ) {
                    window.clearTimeout(
                        state.queueTimers[
                            queuePosition
                        ]
                    );

                    state.queueTimers[
                        queuePosition
                    ] = null;
                }

                state.queueWaiting[
                    queuePosition
                ] = false;

                var active =
                    state.activePositions[
                        queuePosition
                    ];

                if (
                    active &&
                    active.element
                ) {
                    removeElement(
                        active.element
                    );
                }

                state.activePositions[
                    queuePosition
                ] = null;
            }
        );
    }

    function reload() {
        clearTimers();

        clearPollTimer();
        clearVisitorPolling();
        clearVisitorHeartbeat();

        resetQueues();

        state.site = null;
        state.widgets = [];
        state.events = [];
        state.liveVisitors = null;

        state.shownEventIds = {};
        state.shownAnnouncementIds = {};
        state.shownFallbackReviewIds = {};

        state.lastLiveShown = {};
        state.liveCooldownTimers = {};

        state.initialized = false;

        if (state.root) {
            removeElement(
                state.root
            );
        }

        state.root = null;
        state.shadow = null;

        loadConfiguration();
    }

    window.NudgeProof =
        window.NudgeProof || {};

    window.NudgeProof.reload =
        reload;

    window.NudgeProof.version =
        SCRIPT_VERSION;

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            function () {
                loadConfiguration();
            },
            {
                once: true
            }
        );
    } else {
        loadConfiguration();
    }
})();