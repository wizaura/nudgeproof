(function () {
    "use strict";

    /*
     * NudgeProof Embed
     * v2.3.0
     *
     * Rebuilt widget UI while preserving:
     * - configuration loading
     * - event polling
     * - widget queue
     * - Recent Sales
     * - Live Visitors
     * - Reviews
     * - Announcements
     * - visitor heartbeat
     * - impression tracking
     * - Shadow DOM isolation
     * - graceful failure
     * - NudgeProof.reload()
     */

    var SCRIPT_VERSION = "2.3.0";

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
        API_URL + "/visitors";

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

    var LIVE_VISITOR_COOLDOWN = 60000;

    var IMPRESSION_VISIBLE_MS = 1000;

    var IMPRESSION_SESSION_PREFIX =
        "nudgeproof_impression_";

    var state = {
        site: null,
        plan: null,
        usage: null,

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
        },

        impressionInFlight: {}
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
            .replace(
                /'/g,
                "&#039;"
            );
    }

    function replacePlaceholder(
        message,
        placeholder,
        value
    ) {
        return String(
            message || ""
        ).replace(
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
            String(value || "")
                .trim();

        return text
            ? text.charAt(0).toUpperCase()
            : "•";
    }

    function formatRelativeTime(
        dateValue
    ) {
        if (!dateValue) {
            return "Just now";
        }

        var timestamp =
            new Date(
                dateValue
            ).getTime();

        if (
            !Number.isFinite(timestamp)
        ) {
            return "Just now";
        }

        var seconds =
            Math.max(
                0,
                Math.floor(
                    (
                        Date.now() -
                        timestamp
                    ) / 1000
                )
            );

        if (seconds < 60) {
            return "Just now";
        }

        var minutes =
            Math.floor(
                seconds / 60
            );

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
            Math.floor(
                minutes / 60
            );

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
            Math.floor(
                hours / 24
            );

        return (
            days +
            (
                days === 1
                    ? " day ago"
                    : " days ago"
            )
        );
    }

    function getPosition(
        position
    ) {
        return VISUAL_POSITIONS.indexOf(
            position
        ) !== -1
            ? position
            : "bottom-right";
    }

    function getQueuePosition(
        position
    ) {
        var visual =
            getPosition(position);

        return (
            visual === "top-left" ||
            visual === "top-right"
        )
            ? "top"
            : "bottom";
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

        state.activeTimers.push(
            timer
        );

        return timer;
    }

    function clearTimers() {
        state.activeTimers.forEach(
            function (timer) {
                window.clearTimeout(
                    timer
                );
            }
        );

        state.activeTimers = [];

        QUEUE_POSITIONS.forEach(
            function (position) {
                if (
                    state.queueTimers[
                    position
                    ]
                ) {
                    window.clearTimeout(
                        state.queueTimers[
                        position
                        ]
                    );

                    state.queueTimers[
                        position
                    ] = null;
                }

                state.queueWaiting[
                    position
                ] = false;
            }
        );

        Object.keys(
            state.liveCooldownTimers
        ).forEach(
            function (id) {
                window.clearTimeout(
                    state.liveCooldownTimers[
                    id
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
        if (
            state.visitorPollTimer
        ) {
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

    /*
     * ------------------------------------------------------------------------
     * Appearance
     * ------------------------------------------------------------------------
     */

    function getAppearance(
        config
    ) {
        var appearance =
            config &&
                config.appearance &&
                typeof config.appearance ===
                "object"
                ? config.appearance
                : {};

        return {
            width: safeNumber(
                appearance.width,
                360,
                280,
                520
            ),

            radius: safeNumber(
                appearance.radius,
                16,
                0,
                32
            ),

            background:
                appearance.background ||
                "#ffffff",

            textColor:
                appearance.textColor ||
                "#141414",

            secondaryColor:
                appearance.secondaryColor ||
                "#666666",

            accentColor:
                appearance.accentColor ||
                "#007fff",

            shadow:
                appearance.shadow ||
                "0 20px 60px rgba(20,20,20,.14), 0 3px 12px rgba(20,20,20,.06)",

            fontSize: safeNumber(
                appearance.fontSize,
                14,
                11,
                20
            ),

            closeButton:
                appearance.closeButton !== false,

            showAvatar:
                appearance.showAvatar !== false,

            showTimestamp:
                appearance.showTimestamp !== false
        };
    }

    function hexToRgba(
        hex,
        alpha
    ) {
        if (!hex) {
            return (
                "rgba(0,127,255," +
                alpha +
                ")"
            );
        }

        var value =
            String(hex)
                .replace(
                    "#",
                    ""
                );

        if (value.length === 3) {
            value =
                value.charAt(0) +
                value.charAt(0) +
                value.charAt(1) +
                value.charAt(1) +
                value.charAt(2) +
                value.charAt(2);
        }

        if (
            !/^[0-9a-fA-F]{6}$/.test(
                value
            )
        ) {
            return (
                "rgba(0,127,255," +
                alpha +
                ")"
            );
        }

        var r =
            parseInt(
                value.slice(0, 2),
                16
            );

        var g =
            parseInt(
                value.slice(2, 4),
                16
            );

        var b =
            parseInt(
                value.slice(4, 6),
                16
            );

        return (
            "rgba(" +
            r +
            "," +
            g +
            "," +
            b +
            "," +
            alpha +
            ")"
        );
    }

    function getBrandingEnabled() {
        if (!state.plan) {
            return true;
        }

        return (
            state.plan.remove_branding !==
            true
        );
    }

    function brandingHtml(
        appearance
    ) {
        if (
            !getBrandingEnabled()
        ) {
            return "";
        }

        return (
            '<div class="np-branding">' +

            '<span class="np-branding-mark" style="background:' +
            escapeAttribute(
                appearance.accentColor
            ) +
            '"></span>' +

            '<span>Powered by <strong>NudgeProof</strong></span>' +

            '</div>'
        );
    }

    /*
     * ------------------------------------------------------------------------
     * Shadow DOM
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

        document.body.appendChild(
            root
        );

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

            .np-notification {
                position: fixed;
                width: 360px;
                max-width: calc(100vw - 32px);
                padding: 0;
                border: 1px solid rgba(20,20,20,.08);
                border-radius: 16px;
                background: #fff;
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
                    0 20px 60px rgba(20,20,20,.14),
                    0 3px 12px rgba(20,20,20,.06);
                pointer-events: auto;
                opacity: 0;
                transform:
                    translateY(14px)
                    scale(.985);
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

            .np-shell {
                position: relative;
                padding:
                    15px
                    16px
                    11px;
            }

            .np-accent {
                height: 2px;
                width: 100%;
            }

            .np-content {
                display: flex;
                align-items: flex-start;
                gap: 12px;
            }

            .np-body {
                min-width: 0;
                flex: 1;
            }

            .np-avatar,
            .np-type-icon {
                width: 42px;
                height: 42px;
                flex: 0 0 42px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 12px;
                font-size: 14px;
                font-weight: 750;
                line-height: 1;
            }

            .np-avatar {
                border-radius: 50%;
            }

            .np-title,
            .np-reviewer {
                margin: 0;
                font-size: 14px;
                font-weight: 700;
                line-height: 1.35;
            }

            .np-message,
            .np-review-text {
                margin:
                    5px 0 0;
                font-size: 13px;
                line-height: 1.5;
            }

            .np-meta {
                display: flex;
                align-items: center;
                gap: 6px;
                margin-top: 8px;
                font-size: 10px;
                line-height: 1.3;
            }

            .np-dot {
                width: 6px;
                height: 6px;
                flex: 0 0 6px;
                border-radius: 50%;
            }

            .np-live-card,
            .np-review-card {
                margin-top: 1px;
                padding: 11px;
                border-radius: 12px;
            }

            .np-live-number {
                font-size: 22px;
                font-weight: 800;
                line-height: 1;
                letter-spacing: -.04em;
            }

            .np-live-label {
                margin-left: 5px;
                font-size: 9px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: .08em;
            }

            .np-live-progress {
                height: 4px;
                margin-top: 10px;
                overflow: hidden;
                border-radius: 999px;
                background:
                    rgba(0,0,0,.06);
            }

            .np-live-progress > span {
                display: block;
                width: 72%;
                height: 100%;
                border-radius: inherit;
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

            .np-review-card {
                margin-top: 12px;
                border:
                    1px solid
                    rgba(0,0,0,.05);
            }

            .np-quote {
                margin:
                    0 0 -2px;
                font-family:
                    Georgia,
                    serif;
                font-size: 24px;
                line-height: .7;
            }

            .np-cta {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
                margin-top: 13px;
                padding:
                    9px 12px;
                border: 0;
                border-radius: 10px;
                color: #fff;
                font-size: 11px;
                font-weight: 700;
                text-decoration: none;
                cursor: pointer;
                transition:
                    opacity 150ms ease,
                    transform 150ms ease;
            }

            .np-cta:hover {
                opacity: .9;
                transform:
                    translateY(-1px);
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
                border-radius: 7px;
                background: transparent;
                color: #999;
                font-family: inherit;
                font-size: 17px;
                line-height: 1;
                cursor: pointer;
                opacity: .65;
            }

            .np-close:hover {
                background:
                    rgba(0,0,0,.05);
                opacity: 1;
            }

            .np-branding {
                display: flex;
                align-items: center;
                gap: 5px;
                margin-top: 12px;
                padding-top: 9px;
                border-top:
                    1px solid
                    rgba(0,0,0,.055);
                color: #999;
                font-size: 9px;
                line-height: 1;
            }

            .np-branding strong {
                color: inherit;
                font-weight: 800;
            }

            .np-branding-mark {
                width: 5px;
                height: 5px;
                border-radius: 2px;
                display: inline-block;
            }

            @media (max-width: 480px) {
                .np-notification {
                    left: 16px !important;
                    right: 16px !important;
                    width: auto !important;
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

        state.shadow.appendChild(
            style
        );
    }

    /*
     * ------------------------------------------------------------------------
     * Recent Sales
     * ------------------------------------------------------------------------
     */

    function createRecentSales(
        config,
        event
    ) {
        var appearance =
            getAppearance(config);

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

        var relativeTime =
            event && event.created_at
                ? formatRelativeTime(event.created_at)
                : "Just now";

        message = replacePlaceholder(
            message,
            "{name}",
            escapeHtml(name)
        );

        message = replacePlaceholder(
            message,
            "{product}",
            escapeHtml(product)
        );

        message = replacePlaceholder(
            message,
            "{customer}",
            escapeHtml(name)
        );

        message = replacePlaceholder(
            message,
            "{time}",
            escapeHtml(relativeTime)
        );

        var avatar =
            appearance.showAvatar
                ? (
                    '<div class="np-avatar" style="' +
                    'background:' +
                    escapeAttribute(
                        hexToRgba(
                            appearance.accentColor,
                            0.09
                        )
                    ) +
                    ';color:' +
                    escapeAttribute(
                        appearance.accentColor
                    ) +
                    '">' +

                    escapeHtml(
                        getInitial(name)
                    ) +

                    '</div>'
                )
                : "";

        var meta =
            appearance.showTimestamp
                ? (
                    '<div class="np-meta" style="color:' +
                    escapeAttribute(
                        appearance.secondaryColor
                    ) +
                    '">' +

                    '<span class="np-dot" style="background:' +
                    escapeAttribute(
                        appearance.accentColor
                    ) +
                    '"></span>' +

                    escapeHtml(relativeTime) +

                    '</div>'
                )
                : "";

        return (
            '<div class="np-content">' +

            avatar +

            '<div class="np-body">' +

            '<p class="np-title" style="color:' +
            escapeAttribute(
                appearance.textColor
            ) +
            '">' +
            escapeHtml(title) +
            '</p>' +

            '<p class="np-message" style="color:' +
            escapeAttribute(
                appearance.secondaryColor
            ) +
            '">' +
            message +
            '</p>' +

            meta +

            '</div>' +

            '</div>'
        );
    }

    /*
     * ------------------------------------------------------------------------
     * Live Visitors
     * ------------------------------------------------------------------------
     */

    function createLiveVisitors(
        config
    ) {
        var appearance =
            getAppearance(config);

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

        var displayMessage =
            replacePlaceholder(
                message,
                "{count}",
                String(count)
            );

        return (
            '<div>' +

            /* Live activity header */
            '<div style="' +
            "display:flex;" +
            "align-items:center;" +
            "justify-content:space-between;" +
            "gap:12px;" +
            "margin-bottom:10px;" +
            '">' +

            '<div style="' +
            "display:flex;" +
            "align-items:center;" +
            "gap:6px;" +
            "font-size:9px;" +
            "font-weight:600;" +
            "text-transform:uppercase;" +
            "letter-spacing:0.12em;" +
            "color:" +
            escapeAttribute(
                appearance.secondaryColor
            ) +
            '">' +

            '<span style="' +
            "width:6px;" +
            "height:6px;" +
            "border-radius:50%;" +
            "background:" +
            escapeAttribute(
                appearance.accentColor
            ) +
            '"></span>' +

            "Live activity" +

            "</div>" +

            "</div>" +

            /* Live visitor card */
            '<div class="np-live-card" style="' +
            "background:" +
            escapeAttribute(
                hexToRgba(
                    appearance.accentColor,
                    0.045
                )
            ) +
            ";" +
            "border:1px solid " +
            escapeAttribute(
                hexToRgba(
                    appearance.accentColor,
                    0.10
                )
            ) +
            '">' +

            '<div class="np-content">' +

            '<div class="np-type-icon" style="' +
            "background:" +
            escapeAttribute(
                hexToRgba(
                    appearance.accentColor,
                    0.10
                )
            ) +
            ";" +
            "color:" +
            escapeAttribute(
                appearance.accentColor
            ) +
            '">' +

            '<span style="' +
            "width:10px;" +
            "height:10px;" +
            "border-radius:50%;" +
            "background:" +
            escapeAttribute(
                appearance.accentColor
            ) +
            ";" +
            "box-shadow:0 0 0 5px " +
            escapeAttribute(
                hexToRgba(
                    appearance.accentColor,
                    0.12
                )
            ) +
            '"></span>' +

            "</div>" +

            '<div class="np-body">' +

            '<div>' +

            '<span class="np-live-number" style="color:' +
            escapeAttribute(
                appearance.textColor
            ) +
            '">' +
            escapeHtml(
                count
            ) +
            "</span>" +

            '<span class="np-live-label" style="color:' +
            escapeAttribute(
                appearance.secondaryColor
            ) +
            '">' +
            "live now" +
            "</span>" +

            "</div>" +

            '<p class="np-message" style="color:' +
            escapeAttribute(
                appearance.secondaryColor
            ) +
            '">' +
            escapeHtml(
                displayMessage
            ) +
            "</p>" +

            "</div>" +

            "</div>" +

            '<div class="np-live-progress">' +

            '<span style="background:' +
            escapeAttribute(
                appearance.accentColor
            ) +
            '"></span>' +

            "</div>" +

            "</div>" +

            "</div>"
        );
    }

    /*
     * ------------------------------------------------------------------------
     * Reviews
     * ------------------------------------------------------------------------
     */

    function createReview(
        config,
        event
    ) {
        var appearance =
            getAppearance(config);

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

        var rating =
            safeNumber(
                data.rating !== undefined
                    ? data.rating
                    : config.rating,
                5,
                1,
                5
            );

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
                '<span class="np-star" style="' +
                "color:" +
                escapeAttribute(
                    i <= rating
                        ? "#f59e0b"
                        : "#d9dde3"
                ) +
                '">' +
                "★" +
                "</span>";
        }

        var avatar =
            appearance.showAvatar
                ? (
                    '<div class="np-avatar" style="' +
                    "background:" +
                    escapeAttribute(
                        hexToRgba(
                            appearance.accentColor,
                            0.09
                        )
                    ) +
                    ";color:" +
                    escapeAttribute(
                        appearance.accentColor
                    ) +
                    '">' +

                    escapeHtml(
                        getInitial(reviewer)
                    ) +

                    "</div>"
                )
                : "";

        return (
            '<div class="np-content">' +

            avatar +

            '<div class="np-body">' +

            '<div style="' +
            "display:flex;" +
            "align-items:center;" +
            "gap:6px;" +
            '">' +

            '<p class="np-reviewer" style="color:' +
            escapeAttribute(
                appearance.textColor
            ) +
            '">' +
            escapeHtml(reviewer) +
            "</p>" +

            '<span style="' +
            "color:" +
            escapeAttribute(
                appearance.accentColor
            ) +
            ";" +
            "font-size:11px;" +
            "font-weight:800;" +
            '">' +
            "✓" +
            "</span>" +

            "</div>" +

            '<div class="np-stars">' +
            stars +
            "</div>" +

            "</div>" +

            "</div>" +

            '<div class="np-review-card" style="' +
            "background:" +
            escapeAttribute(
                hexToRgba(
                    appearance.accentColor,
                    0.035
                )
            ) +
            ";" +
            "border-color:" +
            escapeAttribute(
                hexToRgba(
                    appearance.accentColor,
                    0.10
                )
            ) +
            '">' +

            '<p class="np-quote" style="color:' +
            escapeAttribute(
                appearance.accentColor
            ) +
            '">' +
            "“" +
            "</p>" +

            '<p class="np-review-text" style="color:' +
            escapeAttribute(
                appearance.secondaryColor
            ) +
            '">' +
            escapeHtml(text) +
            "</p>" +

            '<div class="np-meta" style="color:' +
            escapeAttribute(
                appearance.secondaryColor
            ) +
            '">' +
            "Verified customer review" +
            "</div>" +

            "</div>"
        );
    }

    /*
     * ------------------------------------------------------------------------
     * Announcement
     * ------------------------------------------------------------------------
     */

    function createAnnouncement(
        config
    ) {
        var appearance =
            getAppearance(config);

        var title =
            config.title ||
            "Announcement";

        var message =
            config.message ||
            "We have something exciting to share with you.";

        var buttonText =
            typeof config.cta_text ===
                "string"
                ? config.cta_text.trim()
                : "";

        var buttonUrl =
            typeof config.cta_url ===
                "string"
                ? config.cta_url.trim()
                : "";

        var cta = "";

        if (
            buttonText &&
            buttonUrl
        ) {
            cta =
                '<a class="np-cta" href="' +
                escapeAttribute(
                    buttonUrl
                ) +
                '" target="_blank" rel="noopener noreferrer" style="background:' +
                escapeAttribute(
                    appearance.accentColor
                ) +
                '">' +

                '<span>' +
                escapeHtml(
                    buttonText
                ) +
                "</span>" +

                '<span style="font-size:14px">' +
                "→" +
                "</span>" +

                "</a>";
        }

        return (
            '<div class="np-content">' +

            '<div class="np-type-icon" style="' +
            'background:' +
            escapeAttribute(
                hexToRgba(
                    appearance.accentColor,
                    .09
                )
            ) +
            ';color:' +
            escapeAttribute(
                appearance.accentColor
            ) +
            '">' +
            "↗" +
            "</div>" +

            '<div class="np-body">' +

            '<p class="np-title" style="color:' +
            escapeAttribute(
                appearance.textColor
            ) +
            '">' +
            escapeHtml(
                title
            ) +
            "</p>" +

            '<p class="np-message" style="color:' +
            escapeAttribute(
                appearance.secondaryColor
            ) +
            '">' +
            escapeHtml(
                message
            ) +
            "</p>" +

            "</div>" +

            "</div>" +

            cta
        );
    }

    function createNotificationContent(
        widget,
        event
    ) {
        var config =
            widget.config || {};

        switch (
        widget.type
        ) {
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

    /*
     * ------------------------------------------------------------------------
     * Impression tracking
     * ------------------------------------------------------------------------
     */

    function getImpressionStorageKey(
        widgetId
    ) {
        return (
            IMPRESSION_SESSION_PREFIX +
            siteKey +
            "_" +
            String(widgetId)
        );
    }

    function hasRecordedImpression(
        widgetId
    ) {
        if (!widgetId) {
            return false;
        }

        try {
            return (
                window.sessionStorage.getItem(
                    getImpressionStorageKey(
                        widgetId
                    )
                ) === "1"
            );
        } catch (error) {
            return false;
        }
    }

    function markImpressionRecorded(
        widgetId
    ) {
        if (!widgetId) {
            return;
        }

        try {
            window.sessionStorage.setItem(
                getImpressionStorageKey(
                    widgetId
                ),
                "1"
            );
        } catch (error) { }
    }

    function recordImpression(
        widgetId
    ) {
        if (
            !widgetId ||
            hasRecordedImpression(
                widgetId
            ) ||
            state.impressionInFlight[
            widgetId
            ]
        ) {
            return;
        }

        state.impressionInFlight[
            widgetId
        ] = true;

        fetch(
            API_URL + "/impression",
            {
                method: "POST",
                mode: "cors",
                credentials: "omit",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                keepalive: true
            }
        )
            .then(
                function (response) {
                    if (
                        response.status ===
                        429
                    ) {
                        markImpressionRecorded(
                            widgetId
                        );

                        return null;
                    }

                    if (!response.ok) {
                        throw new Error(
                            "Impression failed"
                        );
                    }

                    return response.json();
                }
            )
            .then(
                function () {
                    markImpressionRecorded(
                        widgetId
                    );
                }
            )
            .catch(
                function () { }
            )
            .finally(
                function () {
                    delete state
                        .impressionInFlight[
                        widgetId
                    ];
                }
            );
    }

    function trackNotificationImpression(
        element,
        widget
    ) {
        if (
            !element ||
            !widget ||
            !widget.id ||
            hasRecordedImpression(
                widget.id
            )
        ) {
            return;
        }

        var timer = null;
        var recorded = false;

        function clearTimer() {
            if (timer) {
                window.clearTimeout(
                    timer
                );

                timer = null;
            }
        }

        function startTimer() {
            if (
                recorded ||
                hasRecordedImpression(
                    widget.id
                ) ||
                timer
            ) {
                return;
            }

            timer =
                window.setTimeout(
                    function () {
                        timer = null;

                        if (
                            recorded
                        ) {
                            return;
                        }

                        recorded = true;

                        recordImpression(
                            widget.id
                        );
                    },
                    IMPRESSION_VISIBLE_MS
                );
        }

        function stopTimer() {
            clearTimer();
        }

        if (
            typeof window.IntersectionObserver ===
            "function"
        ) {
            var observer =
                new IntersectionObserver(
                    function (
                        entries
                    ) {
                        entries.forEach(
                            function (
                                entry
                            ) {
                                if (
                                    entry.isIntersecting &&
                                    entry.intersectionRatio >=
                                    0.5
                                ) {
                                    startTimer();
                                } else {
                                    stopTimer();
                                }
                            }
                        );
                    },
                    {
                        threshold: [
                            0,
                            0.5,
                            1
                        ]
                    }
                );

            observer.observe(
                element
            );

            element.__npImpressionObserver =
                observer;

            return;
        }

        startTimer();
    }

    /*
     * ------------------------------------------------------------------------
     * Notification lifecycle
     * ------------------------------------------------------------------------
     */

    function createNotification(
        widget,
        event,
        visualPosition
    ) {
        var position =
            getPosition(
                visualPosition
            );

        var config =
            widget.config || {};

        var appearance =
            getAppearance(config);

        var element =
            document.createElement(
                "div"
            );

        element.className =
            "np-notification np-" +
            position;

        element.setAttribute(
            "data-widget-id",
            widget.id || ""
        );

        element.setAttribute(
            "data-widget-type",
            widget.type || ""
        );

        element.style.width =
            appearance.width +
            "px";

        element.style.maxWidth =
            "calc(100vw - 32px)";

        element.style.borderRadius =
            appearance.radius +
            "px";

        element.style.background =
            appearance.background;

        element.style.color =
            appearance.textColor;

        element.style.boxShadow =
            appearance.shadow;

        element.style.fontSize =
            appearance.fontSize +
            "px";

        element.style.borderColor =
            hexToRgba(
                appearance.accentColor,
                .10
            );

        var content =
            createNotificationContent(
                widget,
                event
            );

        if (!content) {
            return null;
        }

        element.innerHTML =
            '<div class="np-accent" style="background:' +
            escapeAttribute(
                appearance.accentColor
            ) +
            '"></div>' +

            '<div class="np-shell">' +

            content +

            brandingHtml(
                appearance
            ) +

            "</div>";

        if (
            appearance.closeButton
        ) {
            var closeButton =
                document.createElement(
                    "button"
                );

            closeButton.className =
                "np-close";

            closeButton.type =
                "button";

            closeButton.setAttribute(
                "aria-label",
                "Close notification"
            );

            closeButton.textContent =
                "×";

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

            element.appendChild(
                closeButton
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
            120000
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
            item.widget.id !==
            widget.id
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
            widget.status !==
            "active" ||
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

        if (
            queue.some(
                function (item) {
                    return isSameQueueItem(
                        item,
                        widget,
                        event
                    );
                }
            )
        ) {
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
                options.isLive ===
                true
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
            ] ||
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
                            ].unshift(
                                item
                            );

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
            ].unshift(
                item
            );

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
            widget: item.widget,

            event: item.event,

            eventId: item.eventId,

            element: element,

            isLive:
                item.isLive ===
                true,

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
                        delete state
                            .liveCooldownTimers[
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

                            trackNotificationImpression(
                                element,
                                item.widget
                            );
                        }
                    }
                );
            }
        );

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
            active.element !==
            element ||
            active.finishing
        ) {
            return;
        }

        active.finishing =
            true;

        if (
            active.durationTimer
        ) {
            window.clearTimeout(
                active.durationTimer
            );

            active.durationTimer =
                null;
        }

        if (
            element.__npImpressionObserver
        ) {
            try {
                element
                    .__npImpressionObserver
                    .disconnect();
            } catch (error) { }

            element.__npImpressionObserver =
                null;
        }

        element.classList.remove(
            "np-visible"
        );

        var removeDelay =
            immediate
                ? 0
                : 240;

        window.setTimeout(
            function () {
                removeElement(
                    element
                );

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
     * ------------------------------------------------------------------------
     * Live Visitors
     * ------------------------------------------------------------------------
     */

    function updateLiveNotification(
        widget
    ) {
        if (
            !widget ||
            widget.status !==
            "active" ||
            widget.type !==
            "live_visitors"
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
                widget.config
                    .minimum_visitors,
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

        if (
            count < minimum
        ) {
            state.positionQueues[
                queuePosition
            ] =
                state.positionQueues[
                    queuePosition
                ].filter(
                    function (item) {
                        return !(
                            item &&
                            item.isLive ===
                            true &&
                            item.widget &&
                            item.widget.id ===
                            widget.id
                        );
                    }
                );

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
            active.isLive
        ) {
            return;
        }

        var queue =
            state.positionQueues[
            queuePosition
            ];

        var alreadyQueued =
            queue.some(
                function (item) {
                    return (
                        item &&
                        item.isLive ===
                        true &&
                        item.widget &&
                        item.widget.id ===
                        widget.id
                    );
                }
            );

        if (alreadyQueued) {
            return;
        }

        var now =
            Date.now();

        var lastShown =
            state.lastLiveShown[
            widget.id
            ] || 0;

        if (
            now -
            lastShown <
            LIVE_VISITOR_COOLDOWN
        ) {
            return;
        }

        enqueueNotification(
            widget,
            null,
            {
                skipDelay: false,
                isLive: true
            }
        );
    }

    /*
     * ------------------------------------------------------------------------
     * Events
     * ------------------------------------------------------------------------
     */

    function getLatestUnseenEvent(
        type
    ) {
        for (
            var i = 0;
            i <
            state.events.length;
            i++
        ) {
            var event =
                state.events[i];

            if (
                !event ||
                event.type !==
                type ||
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
                function (
                    widget
                ) {
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
                function (
                    widget
                ) {
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
                function (
                    widget
                ) {
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
                function (
                    event
                ) {
                    return (
                        event &&
                        event.type ===
                        "review"
                    );
                }
            );

        if (
            hasReviewEvent
        ) {
            return;
        }

        widgets.forEach(
            function (
                widget
            ) {
                if (
                    state.shownFallbackReviewIds[
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
            function (
                widget
            ) {
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
                    state.shownAnnouncementIds[
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
            function (
                widget
            ) {
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
        if (
            !state.initialized
        ) {
            return;
        }

        processPurchaseWidgets();

        processReviewWidgets();

        processAnnouncementWidgets();

        processLiveWidgets();
    }

    /*
     * ------------------------------------------------------------------------
     * Configuration
     * ------------------------------------------------------------------------
     */

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
        )
            .filter(
                function (
                    widget
                ) {
                    return (
                        widget &&
                        widget.status ===
                        "active"
                    );
                }
            )
            .map(
                normalizeConfig
            );
    }

    function applyConfiguration(
        data
    ) {
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

        state.plan =
            data.plan ||
            null;

        state.usage =
            data.usage ||
            null;

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
                function (
                    response
                ) {
                    if (
                        !response.ok
                    ) {
                        throw new Error(
                            "Failed to load NudgeProof configuration"
                        );
                    }

                    return response.json();
                }
            )
            .then(
                function (
                    data
                ) {
                    applyConfiguration(
                        data
                    );
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

    /*
     * ------------------------------------------------------------------------
     * Polling
     * ------------------------------------------------------------------------
     */

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
                function (
                    response
                ) {
                    if (
                        !response.ok
                    ) {
                        throw new Error(
                            "Event polling failed"
                        );
                    }

                    return response.json();
                }
            )
            .then(
                function (
                    data
                ) {
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

                    if (
                        data.plan
                    ) {
                        state.plan =
                            data.plan;
                    }

                    if (
                        data.usage
                    ) {
                        state.usage =
                            data.usage;
                    }

                    processWidgets();
                }
            )
            .catch(
                function () { }
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

    /*
     * ------------------------------------------------------------------------
     * Visitors
     * ------------------------------------------------------------------------
     */

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
                body:
                    JSON.stringify({
                        visitor_id:
                            visitorId,

                        page:
                            window.location
                                .href
                    }),
                keepalive: true
            }
        )
            .then(
                function (
                    response
                ) {
                    if (
                        !response.ok
                    ) {
                        throw new Error(
                            "Heartbeat failed"
                        );
                    }

                    return response.json();
                }
            )
            .then(
                function (
                    data
                ) {
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
                function () { }
            );
    }

    function startVisitorHeartbeat() {
        clearVisitorHeartbeat();

        sendHeartbeat();

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
                function (
                    response
                ) {
                    if (
                        !response.ok
                    ) {
                        throw new Error(
                            "Visitor polling failed"
                        );
                    }

                    return response.json();
                }
            )
            .then(
                function (
                    data
                ) {
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
                function () { }
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
            function (
                widget
            ) {
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

    /*
     * ------------------------------------------------------------------------
     * Reset / Public API
     * ------------------------------------------------------------------------
     */

    function resetQueues() {
        QUEUE_POSITIONS.forEach(
            function (
                queuePosition
            ) {
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
                    if (
                        active.element
                            .__npImpressionObserver
                    ) {
                        try {
                            active.element
                                .__npImpressionObserver
                                .disconnect();
                        } catch (
                        error
                        ) { }
                    }

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

        state.plan = null;

        state.usage = null;

        state.widgets = [];

        state.events = [];

        state.liveVisitors =
            null;

        state.shownEventIds =
            {};

        state.shownAnnouncementIds =
            {};

        state.shownFallbackReviewIds =
            {};

        state.lastLiveShown =
            {};

        state.liveCooldownTimers =
            {};

        state.impressionInFlight =
            {};

        state.initialized =
            false;

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
        window.NudgeProof ||
        {};

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