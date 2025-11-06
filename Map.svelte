<script>
    import { onMount, createEventDispatcher } from 'svelte';
    import { chapters } from './routes.js';

    const dispatch = createEventDispatcher();
    let map;
    let currentChapter = 'position-0';
    let lastScrollStep = null;
    let scrollDebounceTimer = null;
    let navigationControl = null;
    let lastTextboxObserver = null;

    async function initializeMap() {
        window.maptilersdk.config.apiKey = 'L1pxMIEc78RDmw6G2tIP';

        map = new window.maptilersdk.Map({
            container: 'map',
            style: '019a5809-86bc-788c-86bb-aed00df4c85d',
            center: [8.5944, 46.6339], // Andermatt - Start high in the Alps
            zoom: 12,
            pitch: 60,
            maxPitch: 85,
            pitchWithRotate: true, // Enable right-click pitch control (desktop)
            touchPitch: true, // Enable two-finger pitch control (mobile)
            navigationControl: false, // Disable automatic navigation control
            geolocateControl: false // Disable automatic geolocate control
        });

        await map.onReadyAsync();

        // Add navigation controls (initially hidden via CSS)
        navigationControl = new window.maptilersdk.NavigationControl({
            visualizePitch: true
        });
        map.addControl(navigationControl, 'top-right');

        dispatch('mapStatus', { type: 'load' });
        setupScrollytelling();
    }

    function enableExploreMode() {
        // Simply dispatch the explore mode event
        // The overlay removal and control fade-in will be handled by App.svelte
        dispatch('mapStatus', { type: 'exploreMode' });
    }

    function setupLastTextboxObserver() {
        const lastTextbox = document.querySelector('#position-3 .textbox');

        if (!lastTextbox) return;

        // Create IntersectionObserver to watch when the textbox exits viewport
        lastTextboxObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    // When textbox is completely out of view (intersectionRatio = 0)
                    // and was previously visible (left the viewport going upward)
                    if (entry.intersectionRatio === 0 && !entry.isIntersecting) {
                        // Check if we scrolled past it (textbox is above viewport)
                        const rect = entry.boundingClientRect;
                        if (rect.bottom < 0) {
                            enableExploreMode();
                        }
                    }
                });
            },
            {
                threshold: [0, 0.1, 1.0], // Track when completely invisible (0) and fully visible (1)
                rootMargin: '0px'
            }
        );

        lastTextboxObserver.observe(lastTextbox);
    }

    function setupScrollytelling() {
        const scroller = window.scrollama();

        scroller
            .setup({
                step: '.scrollytelling section',
                offset: 0.7,
                debug: false,
                once: false // Allow steps to trigger again when scrolling back
            })
            .onStepEnter((response) => {
                if (scrollDebounceTimer) {
                    clearTimeout(scrollDebounceTimer);
                }

                scrollDebounceTimer = setTimeout(() => {
                    const chapter = chapters[response.element.id];
                    if (chapter && map && response.element.id !== lastScrollStep) {
                        lastScrollStep = response.element.id;
                        currentChapter = response.element.id;

                        dispatch('mapStatus', {
                            type: 'positionChange',
                            position: response.element.id
                        });

                        const isMobile = window.innerWidth <= 768;
                        const zoomLevel = isMobile ? chapter.zoom : chapter.zoomDesktop;

                        map.flyTo({
                            center: chapter.center,
                            zoom: zoomLevel,
                            bearing: chapter.bearing,
                            pitch: chapter.pitch || 0,
                            duration: chapter.duration,
                            easing: (t) => t * (2 - t)
                        });

                        document.querySelectorAll('.scrollytelling section').forEach((section) => {
                            section.classList.remove('active');
                        });
                        response.element.classList.add('active');
                    }
                }, 100);
            });

        window.addEventListener('resize', scroller.resize);

        // Set up IntersectionObserver to watch for last textbox exit
        setupLastTextboxObserver();
    }

    onMount(() => {
        initializeMap();
    });
</script>

<div id="map"></div>

<style>
    #map {
        position: fixed;
        top: 0;
        bottom: 0;
        width: 100%;
        height: 100vh;
    }

    :global(.maplibregl-ctrl-top-right) {
        display: none;
    }
</style>
